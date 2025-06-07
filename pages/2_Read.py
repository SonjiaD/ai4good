import streamlit as st
from gtts import gTTS
import tempfile
import os

# --- SESSION STATE INIT ---
if "user_profile" not in st.session_state:
    st.session_state.user_profile = "general"
if "coins" not in st.session_state:
    st.session_state.coins = 0
if "story_index" not in st.session_state:
    st.session_state.story_index = 0
if "current_book" not in st.session_state:
    st.session_state.current_book = None

# --- PAGE SETUP ---
st.set_page_config(page_title="📖 Read and Earn", layout="wide")
st.title("📖 Read and Earn")

# --- SIDEBAR ---
with st.sidebar:
    # st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")
    profile = st.session_state.get("user_profile", "general")
    if profile:
        st.markdown(f"**🧠 Profile:** `{profile.capitalize()}`")
    else:
        st.warning("⚠️ Please complete onboarding first.")

    st.markdown(f"**🪙 Coins:** `{st.session_state.coins}`")
    if st.button("🔄 Restart Book"):
        st.session_state.story_index = 0
        st.session_state.current_book = None
        st.rerun()

# --- STYLE SETTINGS ---
profile = st.session_state.user_profile
font_size = "22px" if profile == "dyslexia" else "20px" if profile == "adhd" else "18px"
line_spacing = "2.0" if profile == "dyslexia" else "1.75" if profile == "adhd" else "1.5"
show_audio = profile in ["dyslexia", "adhd"]

# --- BOOK DATA (LONGER STORIES in SECTIONS) ---
book_library = {
    "Level 1": {
        "Timmy the Turtle": {
            "summary": "A small turtle learns to be brave.",
            "sections": [
                "Timmy the turtle was very shy and loved to hide in his shell.",
                "One day, he saw a bird stuck in the mud and wanted to help.",
                "He took a deep breath and stepped out to push the mud aside.",
                "The bird was free! Timmy felt brave and proud for the first time."
            ]
        },
        "Bunny’s Big Carrot": {
            "summary": "Bunny finds a huge carrot and shares it with friends.",
            "sections": [
                "Bunny found a huge carrot in the garden—it was taller than her!",
                "She pulled hard, and the carrot popped out with a loud ‘PLOP!’",
                "She called all her friends to help carry it home.",
                "They made carrot soup and shared it with the whole forest."
            ]
        }
    },
    "Level 2": {
        "The Curious Fox": {
            "summary": "A fox discovers a magical forest.",
            "sections": [
                "A curious fox loved to read under the stars each night.",
                "One night, a glowing tree caught his eye deep in the forest.",
                "He stepped inside the light and saw animals reading books.",
                "It was a secret forest library, and he was now part of it."
            ]
        },
        "Luna and the Moonlight": {
            "summary": "Luna the owl explores the skies at night.",
            "sections": [
                "Luna flew silently through the dark blue sky.",
                "She counted stars and danced with a comet.",
                "Suddenly, she saw a sleepy child waving from a window.",
                "Luna hooted softly and sent the child sweet dreams."
            ]
        }
    },
    "Level 3": {
        "The Secret Cave": {
            "summary": "A group of friends discover a cave with ancient drawings.",
            "sections": [
                "Liam, Ava, and Max found a cave during their hike.",
                "Inside, drawings covered the walls, glowing with age.",
                "Each picture told stories of animals, kings, and magic.",
                "They promised to protect the cave and its ancient secrets."
            ]
        },
        "Solar System Adventure": {
            "summary": "A spaceship tour through our planets.",
            "sections": [
                "Captain Zee launched into space with her brave crew.",
                "They waved at Mercury and Venus, then zoomed past Earth.",
                "Jupiter's storms were wild, and Saturn's rings sparkled.",
                "They took photos, sang songs, and returned with stories to tell."
            ]
        }
    }
}

# --- MAIN CONTENT ---
if not st.session_state.current_book:
    st.subheader("Choose Your Reading Level")
    level = st.radio("Select a level:", list(book_library.keys()), key="level_select")

    st.subheader(f"Available Books for {level}")
    selected_book = st.selectbox(
        "Pick a book to read:",
        options=list(book_library[level].keys())
    )

    if st.button("Start Reading"):
        st.session_state.current_book = {
            "level": level,
            "title": selected_book,
            "summary": book_library[level][selected_book]["summary"],
            "sections": book_library[level][selected_book]["sections"]
        }
        st.session_state.story_index = 0
        st.rerun()

else:
    book = st.session_state.current_book
    section_text = book["sections"][st.session_state.story_index]

    st.markdown(f"#### 📚 {book['title']}")
    st.markdown(f"*{book['summary']}*")

    st.markdown(f"""
    <div style='background-color:#e6f5ff; padding:20px; border-radius:10px; font-size:{font_size}; line-height:{line_spacing};'>
        {section_text}
    </div>
    """, unsafe_allow_html=True)

    # --- Audio ---
    if show_audio:
        tts = gTTS(section_text)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tts.save(tmp.name)
            audio_path = tmp.name
        st.audio(audio_path)

    # --- Navigation Buttons ---
    col1, col2 = st.columns(2)
    with col1:
        if st.session_state.story_index > 0:
            if st.button("⬅️ Previous"):
                st.session_state.story_index -= 1
                st.rerun()
    with col2:
        if st.session_state.story_index < len(book["sections"]) - 1:
            if st.button("Next ➡️"):
                st.session_state.story_index += 1
                st.session_state.coins += 15
                st.success("+15 coins earned!")
                st.rerun()
        else:
            st.markdown("🎉 **You’ve finished the book! Great job!**")

    # Clean up audio
    if show_audio and os.path.exists(audio_path):
        os.remove(audio_path)
