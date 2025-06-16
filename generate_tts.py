from gtts import gTTS
import os

def generate_speech(text, filename="output.mp3"):
    tts = gTTS(text=text, lang="en")
    tts.save(filename)
    print(f"✅ Saved: {filename}")
    # Optional: play the file (on Windows)
    os.system(f'start {filename}')  # Use 'afplay' on Mac or 'xdg-open' on Linux
