from __future__ import annotations
import os
import io
import base64
import json
import time
from datetime import datetime
from urllib.parse import urljoin
from flask import url_for, request
from pathlib import Path
from typing import List, Tuple

from flask import Flask, request, jsonify, Blueprint, send_from_directory
import fitz  # PyMuPDF
from openai import OpenAI
from dotenv import load_dotenv
from uuid import uuid4
from concurrent.futures import ThreadPoolExecutor
# blueprint
images_bp = Blueprint('images_bp', __name__)

load_dotenv()

# in-memory job store
JOBS: dict[str, dict] = {}
# thread pool for bg work
EXECUTOR = ThreadPoolExecutor(max_workers=2)

# progress fcn
def log_progress(job_id: str | None, message: str) -> None:
    """Append a human-readable progress message to a job, if it exists."""
    if not job_id:
        return
    job = JOBS.get(job_id)
    if job is None:
        return
    job.setdefault("progress", [])
    job["progress"].append(message)
    print(f"[JOB {job_id}] {message}")

# bg worker fcn 
def run_image_job(job_id: str, pdf_bytes: bytes, form_data: dict) -> None:
    """Background worker: run process_story_images and store result in JOBS."""
    JOBS[job_id]["status"] = "running"
    try:
        result = process_story_images(pdf_bytes, form_data, job_id=job_id)
        JOBS[job_id]["status"] = "done"
        JOBS[job_id]["result"] = result
    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = str(e)
        log_progress(job_id, f"Error: {e}")

# --------
# config
# --------

# Valid sizes for gpt-image-1. Keep in sync with API docs
ALLOWED_SIZES = {"1024x1024", "1024x1536", "1536x1024", "auto"}
KID_STYLE_DEFAULT = os.getenv("KID_STYLE_DEFAULT", "on").lower()  # "on" or "off"

# Where images will be written
OUTPUT_DIR = Path("generated_images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Max pages illustrated per upload
MAX_PAGES = int(os.getenv("MAX_PAGES", "5"))

# Default image size
DEFAULT_SIZE = os.getenv("IMAGE_SIZE", "512x512") # changed for faster generation times
if DEFAULT_SIZE not in ALLOWED_SIZES:
    DEFAULT_SIZE = "1024x1024"

# Image model for generation
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gpt-image-1")

# LLM model for story summarization // planning
SUMMARY_MODEL = os.getenv("SUMMARY_MODEL", "gpt-4o-mini") #TODO: change model (if needed)
# ---------------------------
# Flask App + OpenAI Client
# ---------------------------

def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")
    return OpenAI(api_key=api_key)

# PDF → Text
def pdf_bytes_to_pages(pdf_bytes: bytes) -> List[str]:
    """Extract plain text per page from a PDF file (bytes)."""
    pages: List[str] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text = page.get_text("text").strip()
            pages.append(text if text else "")  # Keep page count consistent
    return pages

# story summarizer helper
def summarize_story_pages(
        pages: List[str],
        max_scene: int = 6,
) -> dict:
    """
    Use an LLM to produce a short story summary
    - characters (short descriptions)
    - settings
    - scenes : a list of {id, page_hint, summary} 
    """

    # join all pages into single string, but trim 
    full_text = "\n\n--- PAGE BREAK ---\n\n".join(pages)
    full_text = _trim(full_text, limit=4000)  # limit to 4000 chars

    client = get_openai_client()

    system_msg = {
        "role": "system",
        "content": (
            "You are a helpful assistant that summarizes children's stories for illustration purposes. "
            "Given the full story text, you will extract characters, settings,"
            "and a small list of key scenes to illustrate."
            "Keep everything simple, concrete, and kid-friendly."
        ),
    }
    user_msg = {
        "role": "user",
        "content": (
            f"Story text (may be multiple pages):\n\n{full_text}\n\n"
            f"Please respond ONLY with JSON using this schema:\n"
            "{\n"
            '  "characters": [\n'
            '    "short 1-2 sentence describing where the story mostly happens"\n'
            ' "scenes": [\n'
            "{\n"
            '      "id": 1,\n'
            '      "page_hint": 1, \n'
            '      "summary": "1-3 sentences describing what should be in the illustration"\n'
            "    }\n"
            " ... up to "
            f"{max_scene} scenes total\n"
            "  ]\n"
            "}\n"
            "Use page_hint as an approximate page number (starting at 1) if it is obvious;"
            "otherwise just start from 1 and increment."
        ),
    }

    resp = client.chat.completions.create(
        model=SUMMARY_MODEL,
        messages=[system_msg, user_msg],
        response_format={"type": "json_object"},
    )

    content = resp.choices[0].message.content
    try:
        data = json.loads(content)
    except Exception:
        # if parsing fails, just fall back later
        return {}

    # Ensure basic shape
    data.setdefault("characters", [])
    data.setdefault("setting", "")
    data.setdefault("scenes", [])

    # cap scenes
    if isinstance(data["scenes"], list):
        data["scenes"] = data["scenes"][:max_scene]
    else:
        data["scenes"] = []

    return data
# ---------------------------
# Prompting (Kid-Friendly)
# ---------------------------

KID_STYLE = (
    "Children’s picture-book illustration. Simple, soft shapes and gentle lighting.\n"
    "No text in the image. No brand logos. No weapons or scary content.\n"
    "Palette: warm, cozy colors (soft yellows, light greens, pastel blues).\n"
    "Backgrounds: clean, uncluttered; nature or simple indoor settings.\n"
    "Facial features: minimal, friendly, dot eyes; clear expressions.\n"
    "Framing: keep proportions consistent across images; clear focal subject.\n"
    "Style reference: modern picture-book, high legibility for children."
)

BLOCKLIST = {
    "blood", "gun", "knife", "kill", "dead", "gore", "violence", "nsfw", "corpse", "war", "attack"
}

def _sanitize_scene(txt: str) -> str:
    lowered = txt.lower()
    if any(b in lowered for b in BLOCKLIST):
        return "A calm, friendly, non-violent fairy-tale illustration suitable for children."
    return txt

def _trim(text: str, limit: int = 600) -> str:
    t = " ".join(text.split())
    return (t[:limit] + "…") if len(t) > limit else t

def page_to_prompt(page_text: str, index: int, style_preamble: str | None) -> str:
    """Build the prompt for one page."""
    scene = _sanitize_scene(_trim(page_text, 600))
    if style_preamble:
        return (
            f"{style_preamble}\n"
            f"Scene (page {index + 1}): {scene}\n\n"
            "Instructions:\n"
            "- Avoid any text in the image (no captions).\n"
            "- Compose for square or 4:3 crops; keep the main action centered.\n"
            "- Simple background that supports the scene; clear foreground subject(s).\n"
        )
    return (
        "Illustrate the scene described below.\n\n"
        f"Page {index + 1} summary: {scene}\n\n"
        "No text in the image."
    )

# ---------------------------
# age-focused style decision
# ---------------------------

def decide_kid_style(kid_style_param: str | None, reader_age_param: str | None) -> bool:
    """Decide whether to apply kid style."""
    if kid_style_param is not None:
        s = kid_style_param.lower().strip()
        return s in {"on", "true", "1", "yes"}

    if reader_age_param is not None:
        try:
            age = int(reader_age_param)
            if 7 <= age <= 10:
                return True
        except ValueError:
            pass

    return KID_STYLE_DEFAULT in {"on", "true", "1", "yes"}

def build_style_preamble(reader_age: int | None = None) -> str:
    """Generic picture-book look; optional age hint."""
    parts = [KID_STYLE]
    if reader_age is not None:
        if reader_age <= 7:
            parts.append("Shapes and compositions should be extra simple; avoid clutter.")
        elif reader_age <= 10:
            parts.append("Maintain simple shapes; allow slightly richer scenes for ages 7–12.")
    return "\n".join(parts) + "\n"

# ---------------------------
# openAI img generation
# ---------------------------

def generate_image(prompt: str, size: str = DEFAULT_SIZE) -> bytes:
    """Calls OpenAI Images API and returns PNG bytes."""
    client = get_openai_client()
    resp = client.images.generate(
        model=IMAGE_MODEL,
        prompt=prompt,
        size=size,
        n=1,
    )
    b64_png = resp.data[0].b64_json  # Base64 encoded PNG
    return base64.b64decode(b64_png)

def save_png(png_bytes: bytes, stem: str) -> str:
    """Save PNG bytes to OUTPUT_DIR with a timestamped filename."""
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    filename = f"{stem}-{ts}.png"
    path = OUTPUT_DIR / filename
    path.write_bytes(png_bytes)
    return filename

def file_url(filename: str) -> str:
    # Builds an absolute URL to the blueprint route, including /api prefix
    # return url_for("images_bp.serve_generated", filename=filename, _external=True)
    # TEST:
    """Turn a filename into a static served URL for generated images."""
    # return f"http://localhost:5000/api/generated/{filename}" # locally
    # for deployed version:
    return url_for("images_bp.serve_generated", filename=filename, _external=True)

# NEW: core processor fcn 
def process_story_images(pdf_bytes: bytes, form_data: dict, job_id: str | None = None,) -> dict:
    """
    Core sync logic to:
    - read pages
    - summarize
    - generate images
    - return a JSON-serializable dict
    """
    t0 = time.monotonic()
    log_progress(job_id, "Starting story image illustration")
    pages = pdf_bytes_to_pages(pdf_bytes)
    if not pages:
        raise ValueError("No text found in the PDF.")
    log_progress(job_id, f"Extracted {len(pages)} pages from PDF")

    try:
        cap = int(form_data.get("max_pages", str(MAX_PAGES)))
        if cap <= 0:
            cap = 1
    except ValueError:
        cap = MAX_PAGES

    req_size = form_data.get("size", DEFAULT_SIZE)
    size = req_size if req_size in ALLOWED_SIZES else DEFAULT_SIZE

    kid_style_param = form_data.get("kid_style")
    reader_age_param = form_data.get("reader_age")
    use_kid_style = decide_kid_style(kid_style_param, reader_age_param)

    try:
        age_int = int(reader_age_param) if reader_age_param is not None else None
    except ValueError:
        age_int = None

    base_preamble = build_style_preamble(reader_age=age_int) if use_kid_style else ""

    # ---- story summary (LLM) ----
    # for testing time:
    tbeforeSummary = time.monotonic()
    log_progress(job_id, "Summarizing story to extract key scenes")
    summary = summarize_story_pages(pages, max_scene=cap)
    tafterSummary = time.monotonic()
    log_progress(job_id, f"Story summary done in {tafterSummary - tbeforeSummary:.1f}s.")

    print(f"Time for story summarization: {tafterSummary - tbeforeSummary:.2f} seconds")
    summary = summarize_story_pages(pages, max_scene=cap) #FIXME: modified parameter (test)
    characters = summary.get("characters") or []
    setting = summary.get("setting") or ""
    scenes = summary.get("scenes") or []

    if not scenes:
        scenes = []
        for idx, page_text in enumerate(pages[:cap]):
            scenes.append(
                {
                    "id": idx + 1,
                    "page_hint": idx + 1,
                    "summary": page_text.strip()
                    or "A continuation of the story based on this page.",
                }
            )

    ctx_bits = []
    if setting:
        ctx_bits.append(f"Overall setting: {setting}")
    if characters:
        ctx_bits.append("Main characters:")
        for ch in characters:
            ctx_bits.append(f"- {ch}")

    context_preamble = base_preamble
    if ctx_bits:
        context_preamble = (
            base_preamble + "\n\nStory context:\n" + "\n".join(ctx_bits) + "\n"
        )

    generated_filenames: list[str] = []
    images_json: list[dict] = []

    log_progress(job_id, f"Generating up to {cap} illustration(s)…")
    counted = 0
    for idx, scene in enumerate(scenes):
        if counted >= cap:
            break

        page_hint = scene.get("page_hint") or (idx + 1)
        scene_summary = scene.get("summary") or "A key moment from the story."

        prompt = page_to_prompt(scene_summary, idx, context_preamble)
        # testing time 
        tImgStart = time.monotonic()
        png_bytes = generate_image(prompt, size=size)
        tImgEnd = time.monotonic()
        print(f"Time for image generation (page {page_hint}): {tImgEnd - tImgStart:.2f} seconds")

        tDone = time.monotonic()
        print(f"Total time so far: {tDone - t0:.2f} seconds")

        try:
            png_bytes = generate_image(prompt, size=size)
            filename = save_png(png_bytes, stem=f"page{page_hint}")
            generated_filenames.append(filename)
            images_json.append(
                {
                    "url": file_url(filename),
                    "page": int(page_hint),
                    "prompt": prompt,
                }
            )
            counted += 1
        except Exception as e:
            images_json.append(
                {
                    "error": str(e),
                    "page": int(page_hint),
                }
            )

    if not generated_filenames:
        raise RuntimeError(
            "No images were generated. Check API key/credits and try smaller pages."
        )
    t_done = time.monotonic()
    log_progress(job_id, f"Job completed in {t_done - t0:.1f}s.")
    return {
        "message": "Images generated.",
        "count": len(generated_filenames),
        "images": images_json,
        "summary": {
            "characters": characters,
            "setting": setting,
        },
    }

# ---------------------------
# Routes
# ---------------------------

# NEW /images/story route using the core processor function
@images_bp.route("/images/story", methods=["POST"])
def create_story_images():
    """Synchronous version: do all work in this request."""
    if "pdf" not in request.files:
        return jsonify({"error": "Missing 'pdf' file in form-data."}), 400

    pdf_file = request.files["pdf"]
    try:
        pdf_bytes = pdf_file.read()
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {e}"}), 400

    try:
        result = process_story_images(pdf_bytes, request.form.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(result), 200


# @images_bp.route("/images/story", methods=["POST"])
# def create_story_images():
#     """Generate story images from a PDF, using an LLM summary for coherence"""
#     if "pdf" not in request.files:
#         return jsonify({"error": "Missing 'pdf' file in form-data."}), 400

#     pdf_file = request.files["pdf"]
#     try:
#         pdf_bytes = pdf_file.read()
#         pages = pdf_bytes_to_pages(pdf_bytes)
#     except Exception as e:
#         return jsonify({"error": f"Failed to read PDF: {e}"}), 400

#     if not pages:
#         return jsonify({"error": "No text found in the PDF."}), 400

#     try:
#         cap = int(request.form.get("max_pages", str(MAX_PAGES)))
#         if cap <= 0:
#             cap = 1
#     except ValueError:
#         cap = MAX_PAGES

#     req_size = request.form.get("size", DEFAULT_SIZE)
#     size = req_size if req_size in ALLOWED_SIZES else DEFAULT_SIZE

#     kid_style_param = request.form.get("kid_style")
#     reader_age_param = request.form.get("reader_age")
#     use_kid_style = decide_kid_style(kid_style_param, reader_age_param)

#     try:
#         age_int = int(reader_age_param) if reader_age_param is not None else None
#     except ValueError:
#         age_int = None

#     style_preamble = build_style_preamble(reader_age=age_int) if use_kid_style else None

#         # 1) summarize entire story → story bible
#     summary = summarize_story_pages(pages, max_scene=cap)

#     characters = summary.get("characters") or []
#     setting = summary.get("setting") or ""
#     scenes = summary.get("scenes") or []

#     # if LLM came back empty, fall back to “one scene per page”
#     if not scenes:
#         scenes = []
#         for idx, page_text in enumerate(pages[:cap]):
#             scenes.append(
#                 {
#                     "id": idx + 1,
#                     "page_hint": idx + 1,
#                     "summary": page_text.strip()
#                     or "A continuation of the story based on this page.",
#                 }
#             )

#     # add context text to preamble once
#     ctx_bits = []
#     if setting:
#         ctx_bits.append(f"Overall setting: {setting}")
#     if characters:
#         ctx_bits.append("Main characters:")
#         for ch in characters:
#             ctx_bits.append(f"- {ch}")

#     context_preamble = style_preamble
#     if ctx_bits:
#         context_preamble = style_preamble + "\n\nStory context:\n" + "\n".join(ctx_bits) + "\n"

#     generated_filenames: List[str] = []
#     images_json: List[dict] = []

#     counted = 0
#     for idx, scene in enumerate(scenes):
#         if counted >= cap:
#             break

#         page_hint = scene.get("page_hint") or (idx + 1)
#         scene_summary = scene.get("summary") or "A key moment from the story."

#         # using existing page_to_prompt fcn, but now feeding in scene summary
#         prompt = page_to_prompt(scene_summary, idx, context_preamble)

#         try:
#             png_bytes = generate_image(prompt, size=size)
#             filename = save_png(png_bytes, stem=f"page{page_hint}")
#             generated_filenames.append(filename)
#             images_json.append(
#                 {
#                     "url": file_url(filename),
#                     "page": int(page_hint),
#                     "prompt": prompt,
#                 }
#             )
#             counted += 1
#         except Exception as e:
#             images_json.append(
#                 {
#                     "error": str(e),
#                     "page": int(page_hint),
#                 }
#             )

#     if not generated_filenames:
#         return jsonify(
#             {
#                 "error": "No images were generated. Check API key/credits and try smaller pages."
#             }
#         ), 500

#     return jsonify(
#         {
#             "message": "Images generated.",
#             "count": len(generated_filenames),
#             "images": images_json,
#             "summary": {
#                 "characters": characters,
#                 "setting": setting,
#             },
#         }
#     ), 200

    # old version without story summarization
    # generated_filenames: List[str] = []
    # images_json: List[Tuple[int, str]] = []

    # counted = 0
    # for idx, text in enumerate(pages):
    #     if counted >= cap:
    #         break

    #     scene_src = text.strip() or "A continuation of the story based on this page."
    #     prompt = page_to_prompt(scene_src, idx, style_preamble)

    #     try:
    #         png_bytes = generate_image(prompt, size=size)
    #         filename = save_png(png_bytes, stem=f"page{idx+1}")
    #         generated_filenames.append(file_url(filename))
    #         images_json.append({
    #             "url": file_url(filename),
    #             "page": idx + 1,
    #             "prompt": prompt
    #         })

    #         counted += 1
    #     except Exception as e:
    #         images_json.append({
    #             "error": str(e),
    #             "page": idx + 1
    #         })

    # if not generated_filenames:
    #     return jsonify({"error": "No images were generated. Check API key/credits and try smaller pages."}), 500

    # return jsonify({
    #     "message": "Images generated.",
    #     "count": len(generated_filenames),
    #     "images": images_json
    # }), 200

@images_bp.route("/generated/<path:filename>")
def serve_generated(filename):
    """Serve generated images."""
    return send_from_directory(str(OUTPUT_DIR.resolve()), filename, mimetype="image/png")


@images_bp.get("/images/test-openai")
def test_openai():
    """Connectivity check for OpenAI API."""
    client = get_openai_client()
    models = client.models.list()
    return {"ok": True, "models": [m.id for m in models.data[:5]]}

# NEW: async endpoints
@images_bp.route("/images/story/async", methods=["POST"])
def create_story_images_async():
    """Async version: enqueue a job and return job_id immediately."""
    if "pdf" not in request.files:
        return jsonify({"error": "Missing 'pdf' file in form-data."}), 400

    pdf_file = request.files["pdf"]
    try:
        pdf_bytes = pdf_file.read()
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {e}"}), 400

    form_data = request.form.to_dict()

    job_id = str(uuid4())
    JOBS[job_id] = {
        "status": "queued",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "progress": [],
    }

    # kick off background work
    EXECUTOR.submit(run_image_job, job_id, pdf_bytes, form_data)

    return jsonify({"job_id": job_id, "status": "queued"}), 202


@images_bp.route("/images/story/async/<job_id>", methods=["GET"])
def get_story_images_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    # Don't leak raw python objects; copy only what you need
    payload: dict = {
        "job_id": job_id,
        "status": job.get("status", "unknown"),
        "progress": job.get("progress", []),
    }
    if "result" in job:
        payload["result"] = job["result"]
    if "error" in job:
        payload["error"] = job["error"]

    return jsonify(payload), 200
