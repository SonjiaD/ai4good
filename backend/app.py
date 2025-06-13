
from flask import Flask, request, jsonify 
from flask_cors import CORS
import os
import fitz

#importing ollama
from langchain.chat_models import ChatOllama
from flask import send_file, Flask, request, jsonify

#matcha-tts
import subprocess
import traceback

#whisper
import whisper
import tempfile

app = Flask(__name__) #creates new flask web application 
CORS(app)  # Allow requests from frontend
#makes sure frontend can talk to backend

#matcha-tts
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = "C:\\Program Files\\eSpeak NG\\libespeak-ng.dll"

#whisper
# Hardcode ffmpeg path for Whisper to find it
os.environ["PATH"] += os.pathsep + r"C:\Users\sonja\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin"
odel = whisper.load_model("base")  # Load the Whisper model

@app.route("/") #defines home route like homepage of server
def home():
    return jsonify(message="Flask backend is running!") 
#when someone visits the local host they will get back this JSON message

@app.route("/api/echo", methods=["POST"]) #listens for POST requests at /api/echo
# this is where the frontend will send data to the backend
# the frontend will send a JSON object with a "message" key

# API endpoint to echo back the message sent from the frontend
# this is a simple example of how the backend can process data
# and return a response

#adding new app route for the PyMuPDF
@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid file format'}), 400

    # Save temporarily
    filepath = os.path.join('temp', file.filename)
    os.makedirs('temp', exist_ok=True)
    file.save(filepath)

    # Extract text
    try:
        doc = fitz.open(filepath)
        text = "\n".join([page.get_text() for page in doc])
        doc.close()
        os.remove(filepath)
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#generating quiz questions
@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    story = data.get("text", "")[:1500]

    q_prompt = f"""
You are a reading tutor for kids aged 7–10.

Below is a story. Your job is to create 3 simple, clear reading comprehension questions for the child.

⚠️ DO NOT invent new names, settings, or actions.
✅ ONLY use characters and events from the story **as written**.

Story:
\"\"\"{story}\"\"\"

Output ONLY the 3 questions, numbered:
1. ...
2. ...
3. ...
"""
    llm = ChatOllama(model="llama3", temperature=0.3)
    raw = llm.predict(q_prompt)

    questions = [line.strip().split(". ", 1)[-1]
                 for line in raw.strip().split("\n")
                 if line.strip() and line.strip()[0].isdigit()]

    return jsonify({"questions": questions})

#submiting answer
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    question = data.get("question", "")
    answer = data.get("answer", "")

    fb_prompt = f"""
You are a friendly reading tutor for kids aged 7–10.

Below is a story excerpt, a question about the story, and a student's answer.
Give kind, simple feedback using **only** the story info.

✅ If the answer is correct, say so and explain why using story phrases.
❌ If not, gently explain the correct answer based on the story.

🚫 DO NOT invent names, characters, or facts.

Story:
\"\"\"{story}\"\"\"
Question: {question}
Student Answer: {answer}
"""

    llm = ChatOllama(model="llama3", temperature=0.3)
    feedback = llm.predict(fb_prompt)

    return jsonify({"feedback": feedback})

#matcha-tts
import subprocess

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get("text", "")[:300]  # limit length

    try:
        subprocess.run([
            "matcha-tts",
            "--text", text,
            "--play"
        ], check=True)

        if os.path.exists("utterance_001.wav"):
            return send_file("utterance_001.wav", mimetype="audio/wav")
        else:
            return jsonify({"error": "TTS audio not found"}), 500

    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)}), 500

#whisper
@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    file = request.files['audio']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        file.save(temp.name)
        result = model.transcribe(temp.name)
        transcription = result['text']
    return jsonify({'transcription': transcription})

#route for logging to flask focus
@app.route('/api/log-focus', methods=['POST'])
def log_focus():
    data = request.get_json()
    print(f"[FOCUS] {data['status']} at {data['timestamp']}")
    return jsonify({"status": "ok"})

def echo():
    data = request.get_json()
    return jsonify(response=f"You said: {data.get('message', '')}")

if __name__ == "__main__":
    app.run(debug=True)