import streamlit as st
import base64
import os

# ------------------ SESSION STATE ------------------
if "coins" not in st.session_state:
    st.session_state.coins = 10  # Starting coins
if "unlocked_backgrounds" not in st.session_state:
    st.session_state.unlocked_backgrounds = ["🌆 Sunset"]
if "equipped_background" not in st.session_state:
    st.session_state.equipped_background = "🌆 Sunset"
if "avatar_selection" not in st.session_state:
    st.session_state.avatar_selection = "penguin.png"

# ------------------ BACKGROUND DATA ------------------
BACKGROUND_STYLES = {
    "🌆 Sunset": {
        "css": """
            linear-gradient(to top, #ff6e40, #ff8a65, #ffd54f)
        """,
        "price": 5,
    },
    "🌳 Forest": {
        "css": """
            repeating-linear-gradient(-45deg, #2e7d32, #2e7d32 10px, #1b5e20 10px, #1b5e20 20px),
            radial-gradient(circle at 20% 20%, #4caf50, transparent 40%),
            radial-gradient(circle at 80% 30%, #81c784, transparent 50%),
            #1b5e20
        """,
        "price": 0,
    },
    "🛸 Galaxy": {
        "css": """
            radial-gradient(circle at 20% 30%, #673ab7, transparent 20%),
            radial-gradient(circle at 70% 60%, #311b92, transparent 30%),
            radial-gradient(circle at 50% 50%, #000000, #1a237e)
        """,
        "price": 10,
    },
    "🏖 Beach": {
        "css": """
            linear-gradient(to top, #fbc02d 0%, #fdd835 30%, #81d4fa 70%, #29b6f6 100%)
        """,
        "price": 5,
    },
}

# ------------------ AVATAR OPTIONS ------------------
AVATAR_OPTIONS = {
    "Penguin": "penguin.png",
    "Fox": "fox.png",
    "Rabbit": "rabbit.png",
    "Cat": "cat.png",
}

# ------------------ UI HEADER ------------------
st.set_page_config(page_title="Store – ReadingBuddy.AI", layout="wide")
st.title("🛍️ Avatar Store")

st.markdown(f"### 🪙 Coins: `{st.session_state.coins}`")
st.markdown(f"🎨 Equipped Background: **{st.session_state.equipped_background}**")

# ------------------ AVATAR PREVIEW ------------------
avatar_path = os.path.join("streamlit_app", "images", st.session_state.avatar_selection)
background_css = BACKGROUND_STYLES[st.session_state.equipped_background]["css"]

with open(avatar_path, "rb") as f:
    avatar_data = base64.b64encode(f.read()).decode()

st.markdown("#### Your Current Avatar")
st.markdown(
    f"""
    <div style='width: 250px; height: 250px; background: {background_css}; display: flex; align-items: center; justify-content: center; border-radius: 16px;'>
        <img src="data:image/png;base64,{avatar_data}" style='max-height: 80%; max-width: 80%; border-radius: 12px;' />
    </div>
    """,
    unsafe_allow_html=True
)

# ------------------ AVATAR SELECTION ------------------
st.markdown("---")
st.subheader("🧸 Choose Your Avatar")
avatar_cols = st.columns(len(AVATAR_OPTIONS))

for idx, (name, filename) in enumerate(AVATAR_OPTIONS.items()):
    with avatar_cols[idx]:
        avatar_img_path = os.path.join("streamlit_app", "images", filename)
        with open(avatar_img_path, "rb") as f:
            encoded_img = base64.b64encode(f.read()).decode()

        st.markdown(
            f"<img src='data:image/png;base64,{encoded_img}' width='100' style='border-radius: 8px;' />",
            unsafe_allow_html=True
        )
        if st.button(f"Select {name}"):
            st.session_state.avatar_selection = filename
            st.rerun()

# ------------------ BACKGROUND STORE ------------------
st.markdown("---")
st.subheader("✨ Backgrounds Store")
bg_cols = st.columns(2)

for idx, (bg_name, bg_data) in enumerate(BACKGROUND_STYLES.items()):
    with bg_cols[idx % 2]:
        st.markdown(f"**{bg_name}**")
        st.markdown(
            f"""
            <div style='width: 100%; height: 120px; border-radius: 12px; background: {bg_data['css']}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-bottom: 8px;'>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Remove emoji (assumes 2 characters: emoji + space)
        clean_name = bg_name[2:]

        if bg_name in st.session_state.unlocked_backgrounds:
            if st.button(f"Equip {clean_name}"):
                st.session_state.equipped_background = bg_name
                st.rerun()
        else:
            if st.button(f"Unlock {clean_name} ({bg_data['price']} 🪙)"):
                if st.session_state.coins >= bg_data["price"]:
                    st.session_state.coins -= bg_data["price"]
                    st.session_state.unlocked_backgrounds.append(bg_name)
                    st.session_state.equipped_background = bg_name
                    st.success(f"Unlocked {clean_name}!")
                    st.rerun()
                else:
                    st.warning("Not enough coins. Read more to earn coins!")
