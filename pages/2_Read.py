import streamlit as st
from gtts import gTTS
import tempfile
import os


# Set config
st.set_page_config(page_title="Read and Earn", layout="wide")
st.title("📖 Read and Earn")

with st.sidebar:
    if "user_profile" in st.session_state:
        st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")



# Get user profile from session
profile = st.session_state.get("user_profile", "general")

# Customize settings based on profile
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

# Sample book content
book_text = "Once upon a time, there was a curious fox who loved reading under the stars."
st.markdown(f"""
<div style='background-color:#e6f5ff; padding:20px; border-radius:10px; font-size:{font_size}; line-height:{line_spacing};'>
    {book_text}
</div>
""", unsafe_allow_html=True)

# Audio option
if show_audio:
    tts = gTTS(book_text)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tts.save(tmp.name)
        audio_path = tmp.name
    st.audio(audio_path)

# Rewards
if st.button("🎉 Finish Section"):
    st.success("Great job! You've earned +15 coins!")
    st.session_state.coins = st.session_state.get("coins", 0) + 15
    st.experimental_rerun()

# Coin display
st.markdown(f"### 🪙 Coins: {st.session_state.get('coins', 0)}")
