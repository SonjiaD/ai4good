# onboarding_logic.py
import streamlit as st
from sklearn.tree import DecisionTreeClassifier

def run_onboarding():
    st.title("Welcome to ReadingBuddy.AI")
    st.markdown("Let's personalize your reading buddy experience.")

    reading_style = st.multiselect("How does your child like to read?", [
        "With pictures", "With audio", "Independently", "With help from someone", "Other"])

    focus_time = st.radio("How long can they usually focus?", [
        "Less than 5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"])

    supports = st.multiselect("Do they use any supports?", [
        "Text-to-speech", "Larger or special fonts", "No supports", "Not sure"])

    story_pref = st.multiselect("What kind of stories do they enjoy?", [
        "Animals", "Funny stories", "Adventure", "Real-world facts", "Other"])

    def encode_inputs():
        return [
            int("With pictures" in reading_style),
            int("With audio" in reading_style),
            int(focus_time == "Less than 5 minutes"),
            int(focus_time == "5–10 minutes"),
            int("Text-to-speech" in supports),
            int("Larger or special fonts" in supports),
            int("Animals" in story_pref),
            int("Funny stories" in story_pref),
            int("Adventure" in story_pref),
        ]

    X = [
        [1, 1, 1, 0, 1, 1, 1, 0, 1],  # dyslexia
        [0, 1, 0, 1, 0, 0, 1, 1, 1],  # adhd
        [0, 0, 0, 0, 0, 0, 0, 0, 1],  # general
    ]
    y = ["dyslexia", "adhd", "general"]
    model = DecisionTreeClassifier().fit(X, y)

    if st.button("Submit and Start Reading"):
        if not (reading_style and focus_time and supports and story_pref):
            st.warning("Please answer all the questions.")
        else:
            features = encode_inputs()
            profile = model.predict([features])[0]
            st.success(f"Recommended profile: **{profile}**")
            st.session_state.user_profile = profile
            st.session_state.has_onboarded = True
            st.session_state.coins = 0
            st.switch_page("pages/1_Home.py")
