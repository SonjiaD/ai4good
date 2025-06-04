import streamlit as st
import os
import requests
from dotenv import load_dotenv

# ✅ Load .env with TOGETHER_API_KEY
load_dotenv()
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

# ---- Streamlit UI Setup ---- #
st.set_page_config(page_title="ReadingBuddy.AI", layout="wide")
st.title("ReadingBuddy.AI – Comprehension Feedback Bot")
st.markdown(
    """
    <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        .stButton>button {
            background-color: #4a6240;
            color: white;
            font-weight: 600;
        }
    </style>
    """,
    unsafe_allow_html=True,
)
st.markdown("**Enter a short story, a comprehension question, and the student's answer. The AI will give simple, friendly feedback.**")

# ---- Inputs ---- #
story = st.text_area("Story Text", placeholder="Type or paste a short story here...", height=150)
question = st.text_input("Comprehension Question", placeholder="E.g. Where did the dog go?")
student_answer = st.text_input("Student's Answer", placeholder="E.g. He went to the zoo.")

# ---- LLM (Together.AI) ---- #
def ask_together(prompt):
    url = "https://api.together.xyz/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 300
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content'].strip()
    except Exception as e:
        st.error(f"Error: {e}")
        return "⚠️ The AI couldn't respond. Please try again."

# ---- Generate and Show Feedback ---- #
if st.button("Get Feedback"):
    if story and question and student_answer:
        with st.spinner("Thinking..."):
            prompt = f"""
You are a fun and friendly AI tutor for kids aged 7 to 10. Your job is to give simple and clear feedback about reading comprehension.

The student just read this story:

{story}

Then they were asked this question:

{question}

Here is what the student said:

{student_answer}

Check if their answer matches the story. If it's right, say something encouraging like "Nice job!" or "You got it!" or "Awesome answer!"

If it's wrong, say something like:
- "Almost! But here's what really happened..."
- "Not quite! Let me show you what the story says."

Use short sentences. Avoid big words. Be kind and upbeat. Don’t say “I’m sorry.” Just explain what they missed in a helpful way.

Now give your feedback:
"""
            result = ask_together(prompt)
            st.markdown("### AI Feedback")
            st.success(result)
    else:
        st.warning("Please complete all fields.")
