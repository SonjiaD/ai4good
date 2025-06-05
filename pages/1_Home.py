import streamlit as st
from utils.session import initialize_session_state, display_status, earn_reward




st.set_page_config(page_title="Home – ReadingBuddy.AI", layout="wide")
st.markdown("# 👋 Welcome to ReadingBuddy.AI")

st.markdown("### 🧠 Your personalized reading buddy")

initialize_session_state()
display_status()

col1, col2, col3 = st.columns(3)
for i, col in enumerate([col1, col2, col3]):
    col.image("https://placekitten.com/200/200", caption=f"Buddy {i+1} (Level {i+2})", use_container_width=True)
    col.progress((i+1)*20)

st.markdown("## 🎮 What would you like to do?")
st.button("📖 Start Reading", on_click=lambda: st.switch_page("2_Read"))
st.button("🛍️ Visit Store", on_click=lambda: st.switch_page("3_Store"))
