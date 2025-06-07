# 5_PDF.py
import streamlit as st
import fitz  # PyMuPDF
import os
import tempfile
import subprocess

from langchain.chat_models import ChatOllama
from langchain.prompts import PromptTemplate

st.set_page_config(page_title="📄 Upload & Read PDF", layout="wide")
st.title("📄 Upload & Read PDF")

# ---- Session Init ---- #
if "uploaded_text" not in st.session_state:
    st.session_state.uploaded_text = None
if "pdf_questions" not in st.session_state:
    st.session_state.pdf_questions = []
if "pdf_summary" not in st.session_state:
    st.session_state.pdf_summary = ""

# ---- Upload PDF ---- #
uploaded_file = st.file_uploader("Upload a PDF document", type=["pdf"])

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(uploaded_file.read())
        tmp_path = tmp_pdf.name

    # Open and extract text safely
    with fitz.open(tmp_path) as doc:
        full_text = "\n".join([page.get_text() for page in doc])
        st.session_state.uploaded_text = full_text

    # Now that doc is closed, it's safe to delete
    os.remove(tmp_path)

    st.success("PDF uploaded and text extracted!")


# ---- Display Text & Read Aloud ---- #
#matcha-tts to find the right path to the executable
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"

if st.session_state.uploaded_text:
    st.subheader("Extracted Text")
    st.text_area("PDF Content", value=st.session_state.uploaded_text, height=300)

    if st.button("🔊 Read Aloud with Matcha-TTS"):
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
    if st.button("📄 Summarize Text"):
        from langchain.chat_models import ChatOllama
        from langchain.prompts import PromptTemplate

        llm = ChatOllama(model="tinyllama")
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""Summarize this document for a 10-year-old:
{text}"""
        )
        summary = llm.predict(prompt.format(text=st.session_state.uploaded_text[:1000]))
        st.session_state.pdf_summary = summary
        st.markdown("### ✨ Summary")
        st.success(summary)

# ---- Ask Questions ---- #
st.subheader("AI Quiz Time")

# Step 1: Generate questions button
if st.button("Generate Questions"):
    llm = ChatOllama(model="tinyllama")
    q_prompt = f"""
Read this short story and generate 3 specific reading comprehension questions for a child aged 7-10.

{st.session_state.uploaded_text[:1000]}
"""
    raw = llm.predict(q_prompt)
    questions = [q.strip("-•123. ") for q in raw.strip().split("\n") if q.strip()]
    st.session_state.pdf_questions = questions
    st.session_state.quiz_submitted = [False] * len(questions)
    st.session_state.feedbacks = [""] * len(questions)  # Add this line
    st.rerun()

# Step 2: Display questions + input + submit button
for i, question in enumerate(st.session_state.pdf_questions):
    st.markdown(f"**Q{i+1}: {question}**")
    user_answer = st.text_input(f"Your Answer to Q{i+1}", key=f"answer_{i}")

    if st.button(f"✅ Submit Q{i+1}", key=f"submit_{i}"):
        answer = st.session_state.get(f"answer_{i}", "")
        fb_prompt = f"""
Story:
{st.session_state.uploaded_text[:1000]}

Question: {question}
Student Answer: {answer}

Give kid-friendly feedback. If correct, say why. If incorrect, gently guide them to the right answer.
"""
        llm = ChatOllama(model="tinyllama")
        feedback = llm.predict(fb_prompt)
        st.session_state.feedbacks[i] = feedback
        st.session_state.quiz_submitted[i] = True
        st.rerun()

    # Step 3: Show feedback only if submitted and stored
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
