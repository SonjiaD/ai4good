
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
import time

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

#matcha-tts clarity prompt 
def insert_clarity_tags(text):
    clarity_prompt = (
        "You are an expert in English phonetics helping a TTS system improve intelligibility.\n"
        "Please identify words in the text that are **tense-lax vowel minimal pairs**, like:\n"
        "- pill/peel\n"
        "- pull/pool\n"
        "- bit/beet\n"
        "and wrap these words in exclamation marks (!!) to activate clarity mode in a TTS system.\n"
        "Example:\n"
        "Original: I heard them say pill not peel over by the pool.\n"
        "Tagged: I heard them say !pill! not !peel! over by the !pool!.\n\n"
        f"Here is the input:\n{text}\n\nReturn only the modified text."
    )

    response = ollama_chat.invoke([
        {"role": "user", "content": clarity_prompt}
    ])
    return response.content.strip()

#extremely detailed to be explicit 
# def insert_clarity_tags(raw: str) -> str:
#     """
#     Wraps clarity-sensitive minimal-pair words with ! !.
#     Uses Ollama (Llama-3) to decide which words need help.
#     """

#     prompt = f"""
# You are a speech-clarity enhancer.  
# Given SENTENCE, return **the same sentence** but wrap any
# vowel-confusable minimal-pair words in exclamation marks
# (**!word!**).  
# Only tag when it will help a listener tell pairs apart.
# NEVER delete or change words; keep punctuation.

# ### English minimal-pair patterns to watch
# | Tense vs Lax | Example pair |
# |--------------|--------------|
# | /i/ vs /ɪ/   | peel / pill  |
# | /u/ vs /ʊ/   | pool / pull  |
# | /e/ vs /ɛ/   | bait / bet   |
# | /o/ vs /ɔ/   | coat / cot   |

# ### Tagging examples
# Input ➜ Output
# 1. “Pass me the peel not the pill.” ➜  
#    “Pass me the !peel! not the !pill!.”
# 2. “He jumped in the pool.” ➜  
#    “He jumped in the !pool!.”   (because ‘pool’ could be confused with ‘pull’)
# 3. “The sun is hot.” ➜  
#    “The sun is hot.”            (no tagging needed)

# SENTENCE: {raw}
# ONLY return the transformed sentence – no extra text.
# """

#     llm = ChatOllama(model="llama3", temperature=0.2)
#     return llm.predict(prompt).strip()



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


#new matcha-tts clarity tags
@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get("text", "")[:1000]  # safety limit
    print("🔊 TTS receives:", text)

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(send_tts_message(text))
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#matcha-tts past version WITHOUT clarity tags
# @app.route('/api/tts', methods=['POST'])
# def tts():
#     data = request.get_json()
#     text = data.get("text", "")[:1000] 
#     #length limit to prevent abuse of the audio player

#     try:
#         loop = asyncio.new_event_loop()
#         asyncio.set_event_loop(loop)
#         loop.run_until_complete(send_tts_message(text))

#         # 🕐 Now the file is fully ready
#         while not os.path.exists("utterance_001.wav"):
#             time.sleep(0.1)  # tiny wait loop to ensure file exists

#         # ✅ Return file URL
#         timestamp = int(time.time())
#         return jsonify({"audio_url": f"/api/tts/file?ts={timestamp}"})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# ── Clarify-text endpoint ──────────────────────────────────────────────────
@app.route('/api/clarify-text', methods=['POST'])
def clarify_text():
    data = request.get_json()
    input_text = data.get("text", "")

    clarity_prompt = (
        "Wrap minimal pair words (e.g. pill/peel, pool/pull, bit/beat) with single exclamation marks, like !pill!. "
        "These are words often confused in speech by language learners or in noisy environments.\n\n"
        "Examples:\n"
        "- I said pill not peel → I said !pill! not !peel!\n"
        "- She saw a pool next to the pull-up bar → She saw a !pool! next to the !pull!-up bar\n"
        "- Not the nut → !Not! the !nut!\n\n"
        f"Input:\n{input_text}\n\n"
        "Return only the revised text with !word! tags. Do not explain or comment."
    )


    llm = ChatOllama(model="llama3", temperature=0.3)
    clarified_text = llm.predict(clarity_prompt).strip()

    # 🧼 Clean up unexpected bold or double !! if present
    clarified_text = clarified_text.replace("**", "").replace("!!", "!")

    print("[CLARIFIED TEXT]", clarified_text)
    print("[ORIGINAL TEXT]", input_text)

    return jsonify({"text": clarified_text})

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