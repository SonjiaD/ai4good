import streamlit as st
from sklearn.tree import DecisionTreeClassifier

# Set config before anything else
st.set_page_config(page_title="ReadingBuddy.AI", layout="wide")

# ---- Session Initialization ----
if "has_onboarded" not in st.session_state:
    st.session_state.has_onboarded = False
if "user_profile" not in st.session_state:
    st.session_state.user_profile = None
if "coins" not in st.session_state:
    st.session_state.coins = 0

# ---- Onboarding Section ----
def show_onboarding():
    st.title("Welcome to ReadingBuddy.AI")
    st.markdown("Let's personalize your reading experience:")

    reading_style = st.multiselect("How does your child like to read?", [
        "With pictures", "With audio", "Independently", "With help from someone", "Other"])

    focus_time = st.radio("How long can they usually focus when reading?", [
        "Less than 5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"])

    supports = st.multiselect("Do they use any supports when reading?", [
        "Text-to-speech", "Larger or special fonts", "No supports", "Not sure"])

    story_pref = st.multiselect("What kind of stories do they enjoy most?", [
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

    # Train model (placeholder logic)
    X_train = [
        [1, 1, 1, 0, 1, 1, 1, 0, 1],  # dyslexia
        [0, 1, 0, 1, 0, 0, 1, 1, 1],  # adhd
        [0, 0, 0, 0, 0, 0, 0, 0, 1],  # general
    ]
    y_train = ["dyslexia", "adhd", "general"]
    model = DecisionTreeClassifier().fit(X_train, y_train)

    if st.button("Submit and Start Reading"):
        if not reading_style or not focus_time or not supports or not story_pref:
            st.warning("Please answer all the questions above.")
        else:
            features = encode_inputs()
            prediction = model.predict([features])[0]
            st.session_state.user_profile = prediction
            st.session_state.coins = 0
            st.session_state.has_onboarded = True
            st.success(f"Profile set to: **{prediction.upper()}** 🎉")
            st.experimental_rerun()  # Refresh to load actual homepage

# ---- Homepage Content ----
def show_home():
    st.title("🏠 Home – ReadingBuddy.AI")
    st.markdown(f"👤 Profile: `{st.session_state.user_profile}`")
    st.markdown(f"🪙 Coins: `{st.session_state.coins}`")

    if st.button("Reset Profile"):
        st.session_state.has_onboarded = False
        st.experimental_rerun()

    # Add other home widgets here

# ---- Page Controller ----
if not st.session_state.has_onboarded:
    show_onboarding()
else:
    show_home()
