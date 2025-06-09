# 4_PDF.py
import streamlit as st
import os
import fitz  # PyMuPDF
import tempfile
from langchain.chat_models import ChatOllama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
# from utils.session import initialize_session_state, display_status
#not working just commented it out for now
from streamlit_js_eval import streamlit_js_eval
import time
import subprocess

st.set_page_config(page_title="📄 Upload & Read PDF", layout="wide")
st.title("📄 Upload & Read PDF")

# ---- Session Init ---- #
if "uploaded_text" not in st.session_state:
    st.session_state.uploaded_text = None
if "pdf_questions" not in st.session_state:
    st.session_state.pdf_questions = []
if "pdf_summary" not in st.session_state:
    st.session_state.pdf_summary = ""
if "quiz_submitted" not in st.session_state:
    st.session_state.quiz_submitted = []
if "feedbacks" not in st.session_state:
    st.session_state.feedbacks = []

#matcha-tts
#making sure environment variable is set before calling matcha-tts so don't need to run in terminal
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = "C:\\Program Files\\eSpeak NG\\libespeak-ng.dll"


# # ------------- Inactivity Overlay (for ADHD support) ------------- #
# overlay_css = """
# <style>
# @keyframes fadeIn {
#     from { opacity: 0; }
#     to { opacity: 1; }
# }
# .inactive-overlay {
#     position: fixed;
#     top: 0; left: 0;
#     width: 100vw; height: 100vh;
#     background: rgba(0, 0, 0, 0.7);
#     z-index: 9999;
#     display: flex;
#     flex-direction: column;
#     justify-content: center;
#     align-items: center;
#     animation: fadeIn 1s ease-in-out;
# }
# .inactive-overlay img {
#     max-width: 300px;
#     margin-bottom: 20px;
# }
# </style>
# """

# is_idle = streamlit_js_eval(js_expressions="(Date.now() - window.lastActivity) > 5000", key="idle_check")  # 5 sec for testing
# # st.write("Idle Status:", is_idle)

# if is_idle and "overlay_dismissed" not in st.session_state:
#     st.markdown(overlay_css, unsafe_allow_html=True)
#     st.markdown('<div class="inactive-overlay">', unsafe_allow_html=True)
#     st.image("cat_stretch.png", caption="Time for a quick break 🐱✨", use_column_width=False)

#     if os.path.exists("ding.mp3"):
#         st.audio("ding.mp3", autoplay=True)

#     if st.button("I'm back!"):
#         st.session_state.overlay_dismissed = True
#         st.rerun()

#     st.markdown('</div>', unsafe_allow_html=True)

# ---- Upload PDF ---- #
uploaded_file = st.file_uploader("Upload a PDF document", type=["pdf"])

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(uploaded_file.read())
        tmp_path = tmp_pdf.name

    with fitz.open(tmp_path) as doc:
        full_text = "\n".join([page.get_text() for page in doc])
        st.session_state.uploaded_text = full_text

    os.remove(tmp_path)
    st.success("PDF uploaded and text extracted!")

# ---- Display Text & Read Aloud ---- #

import pathlib

project_root = pathlib.Path(__file__).resolve().parents[2]
output_path = project_root / "utterance_001.wav"

if st.session_state.uploaded_text:
    st.subheader("Extracted Text")
    st.text_area("PDF Content", value=st.session_state.uploaded_text, height=300)

    if st.button("🔊 Read Aloud"):
        try:
            subprocess.run([
                "matcha-tts",
                "--text", st.session_state.uploaded_text[:300],  # limit for speed
                "--output_folder", "."
            ], check=True)
            if os.path.exists("utterance_001.wav"):
                st.audio("utterance_001.wav")
        except subprocess.CalledProcessError as e:
            st.error(f"TTS failed: {e}")

# ---- Generate Summary ---- #
#commented out because it is hallucinating at the moment

#     if st.button("📄 Summarize Text"):
#         from langchain.chat_models import ChatOllama
#         from langchain.prompts import PromptTemplate

#         llm = ChatOllama(model="tinyllama")
#         prompt = PromptTemplate(
#             input_variables=["text"],
#             template="""Summarize this document for a 10-year-old:
# {text}"""
#         )
#         summary = llm.predict(prompt.format(text=st.session_state.uploaded_text[:1000]))
#         st.session_state.pdf_summary = summary
#         st.markdown("### ✨ Summary")
#         st.success(summary)

# ---- Ask Questions ---- #
st.subheader("🧠 AI Quiz Time")

if st.button("🧪 Generate Questions"):
    from langchain.chat_models import ChatOllama
    llm = ChatOllama(model="llama3", temperature=0.3)

    excerpt = st.session_state.uploaded_text[:1500]
    q_prompt = f"""
You are a reading tutor for kids aged 7–10.

Below is a story. Your job is to create 3 simple, clear reading comprehension questions for the child.

⚠️ DO NOT invent new names, settings, or actions.
✅ ONLY use characters and events from the story **as written**.

Story:
\"\"\"{excerpt}\"\"\"

Output ONLY the 3 questions, numbered:
1. ...
2. ...
3. ...
"""

    raw = llm.predict(q_prompt)
    questions = [line.strip().split(". ", 1)[-1] for line in raw.strip().split("\n") if line.strip() and line.strip()[0].isdigit()]
    st.session_state.pdf_questions = questions
    st.session_state.quiz_submitted = [False] * len(questions)
    st.session_state.feedbacks = [""] * len(questions)
    st.session_state.llm = llm  # Save in session
    st.rerun()

for i, question in enumerate(st.session_state.pdf_questions):
    st.markdown(f"**Q{i+1}: {question}**")
    user_answer = st.text_input(f"Your Answer to Q{i+1}", key=f"answer_{i}")

    if st.button(f"✅ Submit Q{i+1}", key=f"submit_{i}"):
        answer = st.session_state.get(f"answer_{i}", "")
        excerpt = st.session_state.uploaded_text[:1500]

        fb_prompt = f"""
You are a friendly reading tutor for kids aged 7–10.

Below is a story excerpt, a question about the story, and a student's answer.
Give kind, simple feedback using **only** the story info.

✅ If the answer is correct, say so and explain why using story phrases.
❌ If not, gently explain the correct answer based on the story.

🚫 DO NOT invent names, characters, or facts.

Story:
\"\"\"{excerpt}\"\"\"
Question: {question}
Student Answer: {answer}
"""

        llm = st.session_state.llm
        feedback = llm.predict(fb_prompt)
        st.session_state.feedbacks[i] = feedback
        st.session_state.quiz_submitted[i] = True
        st.rerun()

    if st.session_state.quiz_submitted[i] and st.session_state.feedbacks[i]:
        st.success(st.session_state.feedbacks[i])

        if st.button(f"🔊 Read Feedback Q{i+1}", key=f"tts_{i}"):
            subprocess.run([
                "matcha-tts",
                "--text", st.session_state.feedbacks[i],
                "--output_folder", "."
            ], check=True)
            if os.path.exists("utterance_001.wav"):
                st.audio("utterance_001.wav")
