import streamlit as st
from streamlit_app.utils.session import initialize_session_state, display_status, earn_reward

st.set_page_config(page_title="Store – ReadingBuddy.AI", layout="wide")
st.title("🛍️ Avatar Store")


initialize_session_state()
display_status()

profile = st.session_state.get("user_profile", "general")
with st.sidebar:
    if "user_profile" in st.session_state and st.session_state.user_profile:
        st.markdown(f"**🧠 Profile:** `{st.session_state.user_profile.capitalize()}`")
    else:
        st.warning("⚠️ Please complete onboarding first.")



st.markdown("### Unlock new outfits using coins! 💰")

cols = st.columns(3)
skins = [
    {"name": "Wizard Outfit", "cost": 200, "image": "https://placekitten.com/201/201"},
    {"name": "Robot Armor", "cost": 300, "image": "https://placekitten.com/202/202"},
    {"name": "Adventure Gear", "cost": 250, "image": "https://placekitten.com/203/203"},
]

for col, skin in zip(cols, skins):
    col.image(skin["image"], caption=skin["name"])
    col.write(f"💰 {skin['cost']} coins")
    col.button(f"Unlock {skin['name']}")
