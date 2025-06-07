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
    st.subheader("AI Quiz")
    if st.button("Generate Questions"):
        from langchain.chat_models import ChatOllama
        llm = ChatOllama(model="tinyllama")

        q_prompt = f"Generate 3 simple reading comprehension questions for this text:\n{st.session_state.uploaded_text[:1000]}"
        questions = llm.predict(q_prompt).strip().split("\n")
        st.session_state.pdf_questions = [q for q in questions if q.strip() != ""]

    for i, q in enumerate(st.session_state.pdf_questions):
        st.markdown(f"**Q{i+1}: {q}**")
        user_answer = st.text_input(f"Your Answer to Q{i+1}", key=f"answer_{i}")

        if user_answer:
            fb_prompt = f"Text: {st.session_state.uploaded_text[:1000]}\nQuestion: {q}\nStudent Answer: {user_answer}\nProvide gentle feedback."
            from langchain.prompts import PromptTemplate
            fb_template = PromptTemplate(
                input_variables=["text", "question", "answer"],
                template="""
Text: {text}
Question: {question}
Student Answer: {answer}

Give kind, simple feedback to a child. If it's correct, praise them. If not, gently explain why and give the right answer.
                """
            )
            filled_prompt = fb_template.format(text=st.session_state.uploaded_text[:1000], question=q, answer=user_answer)
            llm = ChatOllama(model="tinyllama")
            feedback = llm.predict(filled_prompt)
            st.success(feedback)

            if st.button(f"🔊 Read Feedback Q{i+1}", key=f"tts_{i}"):
                subprocess.run([
                    "matcha-tts",
                    "--text", feedback,
                    "--output_folder", "."
                ], check=True)
                if os.path.exists("utterance_001.wav"):
                    st.audio("utterance_001.wav")