import streamlit as st
from langchain.chat_models import ChatOllama
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

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

# ---- Sidebar Settings ---- #
st.sidebar.header("Settings")
model = st.sidebar.selectbox("Choose a Model", ["llama3.2:3b"], index=0)

# ---- Prompt Template ---- #
prompt_template = PromptTemplate(
    input_variables=["full_input"],
    template="""
Story:
{full_input}

As a helpful AI reading tutor, check if the student's answer is correct.
- If it is correct, praise the student.
- If it's wrong, explain gently why and provide a better answer using simple words.

Your response:
"""
)


# ---- LLM Setup ---- #
llm = ChatOllama(model=model)
memory = ConversationBufferMemory(return_messages=True)
chain = LLMChain(llm=llm, prompt=prompt_template, memory=memory)

# ---- Run the Chain ---- #
if st.button("Get Feedback"):
    if story and question and student_answer:
        with st.spinner("Thinking..."):
            full_input = f"Story: {story}\n\nQuestion: {question}\n\nStudent's Answer: {student_answer}"
            result = chain.run({"full_input": full_input})

            st.markdown("### AI Feedback")
            st.success(result)
    else:
        st.warning("Please complete all fields.")
