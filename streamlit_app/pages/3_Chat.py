import streamlit as st
import os
import tempfile
from gtts import gTTS
from dotenv import load_dotenv
import subprocess #matcha-tts

from streamlit_app.utils.session import initialize_session_state, display_status

from langchain.chat_models import ChatOllama
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

# ---- Streamlit UI Setup ---- #
st.set_page_config(page_title="Chat - ReadingBuddy.AI", layout="wide")
st.title("ReadingBuddy.AI – Comprehension Feedback Bot")
st.markdown(
    """
    <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        .stButton>button {
            background-color: #4CAF50;
            color: white;
            font-weight: 600;
        }
    </style>
    """,
    unsafe_allow_html=True,
)
st.markdown("**Enter a short story, a comprehension question, and the student's answer. The AI will give simple, friendly feedback.**")

initialize_session_state() #sets up default values in st.session_state
#helps with accessing uninitialized keys (like memory, user_profile, etc.) (like memory, user_profile, etc.)
display_status()

#matcha-tts to find the right path to the executable
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"

#helper function using matcha-tts
def synthesize_with_matcha(text, output_path="utterance_001.wav"):
    try:
        # Call Matcha-TTS (without --clarity flag) 
        #not sure why paige's clarity flag doesn't work, so using default settings
        subprocess.run([
            "matcha-tts",
            "--text", text,
            "--output_folder", "."
        ], check=True)
        return output_path
    except subprocess.CalledProcessError as e:
        st.error(f"Matcha-TTS failed: {e}")
        return None

# ---- sidebar setup---- #

with st.sidebar:
    if "user_profile" in st.session_state and st.session_state.user_profile:
        st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")
    else:
        st.warning("⚠️ Please complete onboarding first.")
    if st.button("🧹 Clear Chat History"):
        st.session_state.memory = ConversationBufferMemory(return_messages=True)
        st.rerun()

# ---- Set up LangChain LLM and Memory ---- #
if "memory" not in st.session_state:
    st.session_state.memory = ConversationBufferMemory(return_messages=True)

# llm = ChatOllama(model="llama3", temperature=0.5)  # temperature controls randomness; lower is more deterministic

# could switch to model = "tinyllama", faster but less capable
if "llm" not in st.session_state:
    st.session_state.llm = ChatOllama(model="llama3", temperature=0.5)

llm = st.session_state.llm

prompt = PromptTemplate(
    input_variables=["history", "input"],
    template="""
You are a fun and friendly AI tutor for kids aged 7 to 10. Help them understand stories they read.

Conversation so far:
{history}

Student input:
{input}

Respond kindly, using short and friendly sentences. If their answer is right, praise them. If not, gently explain why and show the correct answer from the story.
""",
)

chain = LLMChain(llm=llm, prompt=prompt, memory=st.session_state.memory)

# ---- Inputs ---- #
story = st.text_area("Story Text", placeholder="Type or paste a short story here...", height=150)
question = st.text_input("Comprehension Question", placeholder="E.g. Where did the dog go?")
student_answer = st.text_input("Student's Answer", placeholder="E.g. He went to the zoo.")

# ---- Generate and Show Feedback ---- #
if st.button("Get Feedback"):
    if story and question and student_answer:
        student_input = f"The story is:\n{story}\n\nThe question is:\n{question}\n\nThe student's answer is:\n{student_answer}"
        with st.spinner("Thinking..."):
            result = chain.run(student_input)
            st.markdown("### AI Feedback")
            st.success(result)

            # tts = gTTS(text=result)
            # with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            #     tts.save(tmp_file.name)
            #     st.audio(tmp_file.name, format="audio/mp3")
            
            # Optional: tag words with !word! if desired
            # result = result.replace("pill", "!pill!").replace("peel", "!peel!")

            audio_path = synthesize_with_matcha(result)
            if audio_path and os.path.exists(audio_path):
                st.audio(audio_path, format="audio/wav")
            else:
                st.warning("Could not generate audio with Matcha-TTS.")
    else:
        st.warning("Please complete all fields.")

# ---- Optional: Show Chat History ---- #
with st.expander("🧾 Chat History"):
    for msg in st.session_state.memory.chat_memory.messages:
        role = "🧒 You" if msg.type == "human" else "🤖 Buddy"
        st.markdown(f"**{role}:** {msg.content}")
