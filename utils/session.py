import streamlit as st

def initialize_session_state():
    if 'coins' not in st.session_state:
        st.session_state.coins = 0
    if 'level' not in st.session_state:
        st.session_state.level = 1
    if 'xp' not in st.session_state:
        st.session_state.xp = 0
    if 'xp_needed' not in st.session_state:
        st.session_state.xp_needed = 100

def earn_reward(coins_earned=10, xp_earned=25):
    st.session_state.coins += coins_earned
    st.session_state.xp += xp_earned
    if st.session_state.xp >= st.session_state.xp_needed:
        st.session_state.level += 1
        st.session_state.xp -= st.session_state.xp_needed
        st.session_state.xp_needed = int(st.session_state.xp_needed * 1.25)

def display_status():
    st.markdown(f"### 🪙 Coins: {st.session_state.coins}")
    st.markdown(f"### 📚 Level: {st.session_state.level}")
    progress = st.session_state.xp / st.session_state.xp_needed
    st.progress(progress)
