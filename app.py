import streamlit as st
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
import requests
import streamlit as st

load_dotenv()  # ✅ Load the .env first!

print("Token:", os.getenv("HF_API_TOKEN"))  # ✅ Now this should print the real token



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

# ---- LLM Setup ---- #
def ask_mistral(prompt):
    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    token = os.getenv("HF_API_TOKEN")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "inputs": prompt,
        "parameters": {"temperature": 0.5, "max_new_tokens": 300}
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        st.error(f"⚠️ API Error {response.status_code}: {response.text}")
        return f"Request failed with status {response.status_code}"

    try:
        result = response.json()
        if isinstance(result, list) and "generated_text" in result[0]:
            return result[0]["generated_text"].split(prompt)[-1].strip()
        else:
            return "⚠️ No response from model. Try again in a moment."
    except Exception as e:
        st.error(f"❌ JSON decode error: {e}")
        st.code(response.text)
        return "Failed to decode response."


# ---- Run the Chain ---- #
if st.button("Get Feedback"):
    if story and question and student_answer:
        with st.spinner("Thinking..."):
            prompt = f"""
Story:
{story}

Question:
{question}

Student's Answer:
{student_answer}

As a helpful AI reading tutor, check if the student's answer is correct.
- If correct, praise the student.
- If wrong, explain gently why and provide a better answer using simple words.

Your response:
"""
            result = ask_mistral(prompt)
            st.markdown("### AI Feedback")
            st.success(result)
    else:
        st.warning("Please complete all fields.")

