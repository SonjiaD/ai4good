
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
#websocket-client logic
import asyncio
import websockets
import json

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
model = whisper.load_model("base")  # Load the Whisper model

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

#helper function to send message to local websocket server
async def send_tts_message(text):
    uri = "ws://localhost:1000"
    async with websockets.connect(uri) as websocket:
        message = {"text": text}
        message_json = json.dumps(message)
        await websocket.send(message_json)
        print(f"Sent: {message_json})")

        response = await websocket.recv()
        print(f"Received: {response}")
        return response


import time

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get("text", "")[:1000]

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(send_tts_message(text))

        # 🕐 Now the file is fully ready
        while not os.path.exists("utterance_001.wav"):
            time.sleep(0.1)  # tiny wait loop to ensure file exists

        # ✅ Return file URL
        timestamp = int(time.time())
        return jsonify({"audio_url": f"/api/tts/file?ts={timestamp}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# #matcha-tts v2 old
# @app.route('/api/tts', methods=['POST'])
# def tts():
#     data = request.get_json()
#     text = data.get("text", "")[:300]  # limit length

#     try:
#         # Run the async websocket client inside Flask sync route
#         loop = asyncio.new_event_loop()
#         asyncio.set_event_loop(loop)
#         response = loop.run_until_complete(send_tts_message(text))

#         #after synthesis, taking the server file back

#         if os.path.exists("utterance_001.wav"):
#             return send_file("utterance_001.wav", mimetype="audio/wav")
#         else:
#             return jsonify({"error": "TTS audio not found"}), 500
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


#matcha-tts v1 old
# @app.route('/api/tts', methods=['POST'])
# def tts():
#     data = request.get_json()
#     text = data.get("text", "")[:300]  # limit length

#     try:
#         subprocess.run([
#             "matcha-tts",
#             "--text", text,
#             # need to change form message = text;
#             # copy hit_server.py format into here
#             # doing it with websockets
#             "--play"
#         ], check=True)

#         if os.path.exists("utterance_001.wav"):
#             return send_file("utterance_001.wav", mimetype="audio/wav")
#         else:
#             return jsonify({"error": "TTS audio not found"}), 500

#     except subprocess.CalledProcessError as e:
#         return jsonify({"error": str(e)}), 500

#whisper
@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    file = request.files['audio']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        file.save(temp.name)
        result = model.transcribe(temp.name)
        transcription = result['text']
    return jsonify({'transcription': transcription})

#qa assistant .tsx page
# Free-form QA assistant based on uploaded story
@app.route('/api/qa-chat', methods=['POST'])
def qa_chat():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    user_question = data.get("question", "")

    chat_prompt = f"""
You are an assistant that answers reading comprehension questions for children aged 7-10. Use only the information from the provided story.

Story:
\"\"\"{story}\"\"\"

Question: {user_question}

Answer:
"""

    llm = ChatOllama(model="llama3", temperature=0.3)
    answer = llm.predict(chat_prompt)

    return jsonify({"answer": answer})




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