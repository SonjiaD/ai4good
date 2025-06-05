# ----------------- Setup -----------------
import streamlit as st
from sklearn.tree import DecisionTreeClassifier

st.set_page_config(page_title="Onboarding – ReadingBuddy.AI", layout="wide")
st.title("🧸 Welcome to ReadingBuddy.AI!")
st.markdown("### Let's personalize your reading buddy experience.")

with st.sidebar:
    if "user_profile" in st.session_state:
        st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")


# ----------------- Input -----------------
st.subheader("Parent Questionnaire")

reading_style = st.multiselect("How does your child like to read?", [
    "With pictures", "With audio", "Independently", "With help from someone", "Other"])

focus_time = st.radio("How long can they usually focus when reading?", [
    "Less than 5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"])

supports = st.multiselect("Do they use any supports when reading?", [
    "Text-to-speech", "Larger or special fonts", "No supports", "Not sure"])

story_pref = st.multiselect("What kind of stories do they enjoy most?", [
    "Animals", "Funny stories", "Adventure", "Real-world facts", "Other"])

# ----------------- Model + Encoding -----------------
def encode_inputs(reading_style, focus_time, supports, story_pref):
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

X_train = [
    [1, 1, 1, 0, 1, 1, 1, 0, 1],  # dyslexia
    [0, 1, 0, 1, 0, 0, 1, 1, 1],  # adhd
    [0, 0, 0, 0, 0, 0, 0, 0, 1],  # general
]
y_train = ["dyslexia", "adhd", "general"]

model = DecisionTreeClassifier()
model.fit(X_train, y_train)

# ----------------- Submission Logic -----------------
def submit_and_start():
    if not reading_style or not focus_time or not supports or not story_pref:
        st.warning("Please answer all the questions above.")
    else:
        features = encode_inputs(reading_style, focus_time, supports, story_pref)
        prediction = model.predict([features])[0]
        st.session_state.user_profile = prediction
        st.session_state.coins = 0
        st.switch_page("pages/1_Home.py")

# ----------------- Button -----------------
st.button("🚀 Submit and Start Reading", on_click=submit_and_start)
