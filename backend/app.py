
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz

from flask import send_file, Flask, request, jsonify

#matcha-tts
import subprocess
import traceback
import time

# gemini tts
import tts_service
import io
#websocket-client logic
import asyncio
import websockets
import json

#whisper
import whisper
import tempfile

#questionnaire copying
import shutil
import os
import json
from flask import Flask, request, jsonify

#paragraph structuring
import re

#anthropic - claude (not using anymore cuz limited)
import anthropic    #gives access to Claude API
import os
from dotenv import load_dotenv  #load .env file automatically

#gemini (unlimited)
import google.generativeai as genai #gemini ai lib

#loading env variables from .env file
load_dotenv()

# #initialize anthropic claude client, calling the key from .env file
# claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

#configure gemini api key
genai.configure(api_key = os.getenv("GOOGLE_API_KEY"))

#initialize gemini model
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

app = Flask(__name__) #creates new flask web application 

CORS(app)  # Allow requests from frontend
#makes sure frontend can talk to backend

PROFILE_PATH = os.path.join(os.path.dirname(__file__), "profile.json")

def _load_profile():
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    else:
        return {"questionnaire": {}, "struggles": []}

def _save_profile(data):
    with open(PROFILE_PATH, "w") as f:
        json.dump(data, f, indent=2)

#helper fnc to call gemini
def call_gemini(prompt, temperature=0.3):
    """
    Helper function to call Gemini API
    
    Args:
        prompt: The text prompt to send to Gemini
        temperature: Controls randomness (0-1). Lower = more focused
    
    Returns:
        The text response from Gemini
    """
    response = gemini_model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
        )
    )
    return response.text

@app.route("/api/save-questionnaire", methods=["POST"])
def save_questionnaire():
    try:
        answers = request.get_json()
        print("[📨 Received questionnaire]", answers)

        profile = _load_profile()
        profile["questionnaire"] = answers
        _save_profile(profile)

        # Copy to frontend/public/profile.json
        shutil.copy("profile.json", "../frontend/public/profile.json")

        return jsonify({"msg": "questionnaire stored"})

    except Exception as e:
        import traceback
        print("❌ ERROR in /api/save-questionnaire:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/profile", methods=["GET"])
def get_profile():
    try:
        profile = _load_profile()
        return jsonify(profile)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


#helper to turn saved questionnaire into short context string
def _profile_context() -> str:
    """Return a compact, human-readable summary of the questionnaire."""
    profile = _load_profile()
    q = profile.get("questionnaire", {})
    if not q:
        return ""                       # nothing yet

    key_map = {
        "role":           "Role",
        "reading_style":  "Prefers",
        "reading_time":   "Typical session lasts this amount of time",
        "reading_supports": "Helpful supports",
        "reading_challenges": "Challenges"
        # add more keys as you create them
    }

    lines = []
    for k, label in key_map.items():
        v = q.get(k)
        if v:
            if isinstance(v, list):
                lines.append(f"{label}: {', '.join(v)}")
            else:
                lines.append(f"{label}: {v}")
    return "\n".join(lines)
# -----------------------------------------
#matcha-tts
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = "C:\\Program Files\\eSpeak NG\\libespeak-ng.dll"

#whisper
# Hardcode ffmpeg path for Whisper to find it
os.environ["PATH"] += os.pathsep + r"C:\Users\sonja\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin"
model = whisper.load_model("base")  # Load the Whisper model


@app.route("/") #defines home route like homepage of server
def home():
    return jsonify(message="Flask backend is running!") 


@app.route("/api/hello")
def hello():
    return "👋 Hello!"

# adding new app route for the PyMuPDF
# @app.route('/api/upload-pdf', methods=['POST'])
# def upload_pdf():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400

#     file = request.files['file']
    
#     if not file.filename.endswith('.pdf'):
#         return jsonify({'error': 'Invalid file format'}), 400

#     # Save temporarily
#     filepath = os.path.join('temp', file.filename)
#     os.makedirs('temp', exist_ok=True)
#     file.save(filepath)

#     # Extract text
#     try:
#         doc = fitz.open(filepath)
#         text = "\n".join([page.get_text() for page in doc])
#         doc.close()
#         os.remove(filepath)
#         return jsonify({'text': text})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid file format'}), 400

    # Save temporarily
    filepath = os.path.join('temp', file.filename)
    os.makedirs('temp', exist_ok=True)
    file.save(filepath)

    try:
        doc = fitz.open(filepath)
        raw_text = "\n".join([page.get_text() for page in doc])
        doc.close()
        os.remove(filepath)

        # Split lines, extract title
        lines = [line.strip() for line in raw_text.strip().splitlines() if line.strip()]
        title = lines[0] if lines else "Untitled"
        combined = "\n".join(lines[1:]) if len(lines) > 1 else ""

        # Split paragraphs (double newlines or quotes)
        raw_paragraphs = re.split(r'\n\s*\n|(?=\n["“])', combined)

        # Replace inner line breaks with space to fix weird splits like "With\na smile"
        paragraphs = [
            re.sub(r"\s*\n\s*", " ", p).strip()
            for p in raw_paragraphs if p.strip()
        ]

        # Replace all internal newlines with spaces before splitting
        cleaned_text = combined.replace("\n", " ")

        # Naively split paragraphs by sentence breaks for now
        # can improve this later using NLP or by detecting longer pauses
        raw_paragraphs = re.split(r'(?<=[.?!])\s+(?=[A-Z“"])', cleaned_text)

        paragraphs = [p.strip() for p in raw_paragraphs if p.strip()]

        print("[PARAGRAPHS]", paragraphs)

        return jsonify({
            "text": raw_text,
            "title": title,
            "paragraphs": paragraphs
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



#generating quiz questions
@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    story = data.get("text", "")[:1500]

    q_prompt = f"""
You are a reading tutor for kids aged 7–10.

Below is a story. Your job is to create 3 simple, clear reading comprehension questions for the child.

⚠️ DO NOT invent new names, settings, or actions.
✅ ONLY use characters and events from the story **as written**.

Story:
\"\"\"{story}\"\"\"

Output ONLY the 3 questions, numbered:
1. ...
2. ...
3. ...
"""
    raw = call_gemini(q_prompt, temperature = 0.3)

    questions = [line.strip().split(". ", 1)[-1]
                 for line in raw.strip().split("\n")
                 if line.strip() and line.strip()[0].isdigit()]

    return jsonify({"questions": questions})

#submiting answer
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    question = data.get("question", "")
    answer = data.get("answer", "")

    fb_prompt = f"""
You are a friendly reading tutor for kids aged 7–10.

Below is a story excerpt, a question about the story, and a student's answer.
Give kind, simple feedback using **only** the story info.

✅ If the answer is correct, say so and explain why using story phrases.
❌ If not, gently explain the correct answer based on the story.

🚫 DO NOT invent names, characters, or facts.

Story:
\"\"\"{story}\"\"\"
Question: {question}
Student Answer: {answer}
"""

    feedback = call_gemini(fb_prompt, temperature = 0.3)

    return jsonify({"feedback": feedback})

#helper function to send message to local websocket server
async def send_tts_message(text):
    uri = "ws://localhost:1000"
    async with websockets.connect(uri) as websocket:
        message = {"text": text}
        message_json = json.dumps(message)
        await websocket.send(message_json)
        print(f"Sent: {message_json})")

        response = await websocket.recv()
        print(f"Received: {response}")
        return response


#new matcha-tts clarity tags
@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get("text", "")[:1000]  # safety limit
    print("🔊 TTS receives:", text)

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(send_tts_message(text))
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#clarify text for matcha-tts
@app.route('/api/clarify-text', methods=['POST'])
def clarify_text():
    data = request.get_json()
    input_text = data.get("text", "")

    clarity_prompt = (
        "Wrap minimal pair words (e.g. pill/peel, pool/pull, bit/beat) with single exclamation marks, like !pill!. "
        "These are words often confused in speech by language learners or in noisy environments.\n\n"
        "Examples:\n"
        "- I said pill not peel → I said !pill! not !peel!\n"
        "- She saw a pool next to the pull-up bar → She saw a !pool! next to the !pull!-up bar\n"
        "- Not the nut → !Not! the !nut!\n\n"
        f"Input:\n{input_text}\n\n"
        "Return only the revised text with !word! tags. Do not explain or comment. Do NOT start with phrases like 'Here is the revised text'"
    )

    clarified_text = call_gemini(clarity_prompt, temperature = 0.3).strip()

    # Clean up unexpected bold or double !! if present
    #sometimes the model might return text with **bold** or !!double exclamations!!
    clarified_text = clarified_text.replace("**", "").replace("!!", "!")

    print("[CLARIFIED TEXT]", clarified_text)
    print("[ORIGINAL TEXT]", input_text)

    return jsonify({"text": clarified_text})

#whisper
@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    file = request.files['audio']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        file.save(temp.name)
        result = model.transcribe(temp.name)
        transcription = result['text']
    return jsonify({'transcription': transcription})

#qa assistant .tsx page
# Free-form QA assistant based on uploaded story
@app.route('/api/qa-chat', methods=['POST'])
def qa_chat():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    user_question = data.get("question", "")

    #pull user context 
    learner_ctx = _profile_context()

    chat_prompt = f"""
You are an assistant that answers reading-comprehension questions for children aged 7-10.
Use only the information from the provided story. Do not summarize the story if the user asks.
If the user asks to summarize, politely decline and say you can only answer questions about the story.
Your role is to answer reading comprehension questions based on the following user profile in mind
to tailor explanations:


=== Learner profile ===
{learner_ctx or "No profile data yet."}
=======================


Story:
\"\"\"{story}\"\"\"


Question: {user_question}

Answer:
"""
    answer = call_gemini(chat_prompt, temperature = 0.3)
    

    return jsonify({"answer": answer})

#api call for definition feature on extracted text page
@app.route("/api/define", methods=["POST"])
def define_word():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    word = data.get("word", "").strip()

    if not word:
        return jsonify({"error": "No word provided"}), 400

    prompt = f"""
You are a friendly English tutor for children aged 7–10.

Below is a story and a word that appears in it. Explain what the word means in the context of the story, using simple language that a child would understand.

Word: "{word}"

Story:
\"\"\"{story}\"\"\"

Your job:
- Give a short, clear definition of the word.
- Use examples or clues from the story if helpful.
- Do not explain all possible meanings — only what it means in this story.
- Keep it friendly, simple, and just 1–2 short sentences.

Answer:

"""
    result = call_gemini(prompt, temperature = 0.3)

    return jsonify({"definition": result.strip()})

# route for calling gemini tts
@app.route("/api/tts-gemini", methods=["POST"])
def tts_gemini():
    """
    JSON body:
    {
      "text": "Say cheerfully: Have a wonderful day!",
      "voice": "Erinome"
    }
    Returns: audio/wav file bytes
    """
    try:
        data = request.get_json(force=True) or {}
        text = (data.get("text") or "").strip()
        voice = (data.get("voice") or "Erinome").strip()

        if not text:
            return jsonify({"error": "Missing 'text'"}), 400

        wav_bytes = tts_service.synthesize_tts(text, voice)

        return send_file(
            io.BytesIO(wav_bytes),
            mimetype="audio/wav",
            as_attachment=False,
            download_name="tts.wav",
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



#route for logging to flask focus
@app.route('/api/log-focus', methods=['POST'])
def log_focus():
    data = request.get_json()
    print(f"[FOCUS] {data['status']} at {data['timestamp']}")
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)