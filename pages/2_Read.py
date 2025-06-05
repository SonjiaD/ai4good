import streamlit as st
from gtts import gTTS
import tempfile
import os

# -------------- Page Config -------------- #
st.set_page_config(page_title="Read and Earn", layout="wide")
st.title("📖 Read and Earn")

with st.sidebar:
    if "user_profile" in st.session_state and st.session_state.user_profile:
        st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")
    else:
        st.warning("⚠️ Please complete onboarding first.")

# -------------- Profile Settings -------------- #
profile = st.session_state.get("user_profile", "general")

if profile == "dyslexia":
    font_size = "22px"
    line_spacing = "2.0"
    show_audio = True
elif profile == "adhd":
    font_size = "20px"
    line_spacing = "1.75"
    show_audio = True
else:  # general
    font_size = "18px"
    line_spacing = "1.5"
    show_audio = False

# -------------- Book Dataset -------------- #
book_library = {
    "Level 1": [
        {
            "title": "Timmy the Turtle",
            "summary": "A small turtle learns to be brave.",
            "text": "Timmy the turtle was very shy. But one day, he helped a friend and felt proud!"
        },
        {
            "title": "Bunny’s Big Carrot",
            "summary": "Bunny finds a huge carrot and shares it with friends.",
            "text": "Bunny found a big carrot. It was so big! She shared it with her friends."
        }
    ],
    "Level 2": [
        {
            "title": "The Curious Fox",
            "summary": "A fox discovers a magical forest.",
            "text": "Once upon a time, there was a curious fox who loved reading under the stars. One night, he found a glowing tree..."
        },
        {
            "title": "Luna and the Moonlight",
            "summary": "Luna the owl explores the skies at night.",
            "text": "Luna flew through the night sky. She saw stars, clouds, and even a comet."
        }
    ],
    "Level 3": [
        {
            "title": "The Secret Cave",
            "summary": "A group of friends discover a cave with ancient drawings.",
            "text": "Liam, Ava, and Max stumbled upon a hidden cave during their hike. Inside, they found drawings that told a story thousands of years old."
        },
        {
            "title": "Solar System Adventure",
            "summary": "A spaceship tour through our planets.",
            "text": "Captain Zee took her crew past Mercury, Venus, Earth, and beyond! Each planet had something amazing to show."
        }
    ]
}

# -------------- Level Selection -------------- #
st.subheader("Choose Your Reading Level")
level = st.radio("Select a level:", list(book_library.keys()))

# -------------- Book Selection -------------- #
st.subheader(f"Available Books for {level}")
selected_book = st.selectbox(
    "Pick a book to read:",
    options=[book["title"] for book in book_library[level]]
)

book = next(book for book in book_library[level] if book["title"] == selected_book)
st.markdown(f"#### 📚 {book['title']}")
st.markdown(f"*{book['summary']}*")

# -------------- Book Display -------------- #
st.markdown(f"""
<div style='background-color:#e6f5ff; padding:20px; border-radius:10px; font-size:{font_size}; line-height:{line_spacing};'>
    {book['text']}
</div>
""", unsafe_allow_html=True)

# -------------- Audio Option -------------- #
if show_audio:
    tts = gTTS(book['text'])
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tts.save(tmp.name)
        audio_path = tmp.name
    st.audio(audio_path)

# -------------- Reward System -------------- #
if st.button("🎉 Finish Section"):
    st.success("Great job! You've earned +15 coins!")
    st.session_state.coins = st.session_state.get("coins", 0) + 15
    st.rerun()

st.markdown(f"### 🪙 Coins: {st.session_state.get('coins', 0)}")
