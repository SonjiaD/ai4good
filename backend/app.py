#.\backend_env\Scripts\Activate.ps1
#need to be in backend folder

from __future__ import annotations
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import fitz
import uuid
from datetime import datetime

#matcha-tts
#import subprocess
#import traceback
#import time

# gemini tts

import io
#websocket-client logic
import asyncio
import websockets
import json

#whisper
#import whisper
#import tempfile

#questionnaire copying
import shutil
import os
import json
from flask import Flask, request, jsonify

#paragraph structuring
import re

#anthropic - claude (not using anymore cuz limited)
# import anthropic    #gives access to Claude API
import os
from dotenv import load_dotenv  #load .env file automatically

#gemini (unlimited)
import google.generativeai as genai #gemini ai lib

#supabase client, database
from supabase_client import supabase

#google cloud text-to-speech
from google.cloud import texttospeech

#google cloud speech-to-text
from google.cloud import speech

#loading env variables from .env file
load_dotenv()

import tts_service  #moving to after load_dotenv

# Simple rate limiter for Gemini API calls (15 requests per minute limit)
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_calls: int = 10, time_window: int = 60):
        """
        Simple rate limiter using sliding window.
        max_calls: Maximum calls allowed
        time_window: Time window in seconds
        """
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = deque()
    
    def is_allowed(self) -> bool:
        now = time.time()
        # Remove calls outside the time window
        while self.calls and self.calls[0] < now - self.time_window:
            self.calls.popleft()
        
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False

gemini_rate_limiter = RateLimiter(max_calls=10, time_window=60)  # 10 calls per 60 seconds

# #initialize anthropic claude client, calling the key from .env file
# claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

#configure gemini api key
genai.configure(api_key = os.getenv("GOOGLE_API_KEY"))

#initialize gemini model
gemini_model = genai.GenerativeModel('gemini-2.0-flash-lite')

#initialize google tts client
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_TTS_CREDENTIALS_PATH")
tts_client = texttospeech.TextToSpeechClient()

#initialize google sst client
stt_client = speech.SpeechClient()


app = Flask(__name__) #creates new flask web application 

CORS(app,
     origins=["http://localhost:5173", "https://readingbuddy.vercel.app", "http://localhost:3000"],
     resources={r"/*": {"origins": ["http://localhost:5173", "https://readingbuddy.vercel.app", "http://localhost:3000"]}})  # Allow requests from frontend including Blueprint routes
#makes sure frontend can talk to backend

# registering img generation blueprint:
from app_story_images import images_bp
app.register_blueprint(images_bp, url_prefix='/api')

PROFILE_PATH = os.path.join(os.path.dirname(__file__), "profile.json")

STORY_STORAGE_PATH = os.path.join(os.getcwd(), "user_data", "stories")
os.makedirs(STORY_STORAGE_PATH, exist_ok=True)

def _load_profile():
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    else:
        return {"questionnaire": {}, "struggles": []}

def _save_profile(data):
    with open(PROFILE_PATH, "w") as f:
        json.dump(data, f, indent=2)

#helper fnc to call gemini
def call_gemini(prompt, temperature=0.3, max_retries=3):
    """
    Helper function to call Gemini API with retry logic
    
    Args:
        prompt: The text prompt to send to Gemini
        temperature: Controls randomness (0-1). Lower = more focused
        max_retries: Maximum number of retries on rate limit (429)
    
    Returns:
        The text response from Gemini
    """
    import time
    from google.api_core.exceptions import ResourceExhausted
    
    for attempt in range(max_retries):
        try:
            if not gemini_rate_limiter.is_allowed():
                wait_time = 1  # Wait 1 second before retrying
                print(f"Rate limiter active. Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue

            response = gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                )
            )
            return response.text
        except ResourceExhausted as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # exponential backoff: 1s, 2s, 4s
                print(f"Rate limited. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait_time)
            else:
                print(f"Max retries exceeded. Returning error message.")
                return f"Error: Gemini API rate limited. Please try again in a few minutes."
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            raise

@app.route("/api/save-questionnaire", methods=["POST"])
def save_questionnaire():
    try:
        data = request.get_json()
        answers = data.get("answers")  # Questionnaire answers
        user_id = data.get("user_id")  # User ID from frontend
        access_token = data.get("access_token")  # Access token for authentication

        print(f"[📨 Received questionnaire] User: {user_id}")
        print(f"[🔍 Access token received?] {access_token is not None}")
        if access_token:
            print(f"[🔐 Token preview] {access_token[:20]}...")

        # Validate input
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        if not answers:
            return jsonify({"error": "answers are required"}), 400

        # Create authenticated Supabase client if access_token is provided
        if access_token:
            from supabase import create_client
            auth_supabase = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_KEY")
            )
            # Set the auth header for this request
            auth_supabase.postgrest.auth(access_token)
            client_to_use = auth_supabase
            print("[🔐 Using authenticated Supabase client]")
        else:
            client_to_use = supabase
            print("[⚠️ Using anonymous Supabase client - RLS may block this]")

        # Save to Supabase
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()

        # Prepare data for upsert - username is required (NOT NULL constraint)
        profile_data = {
            "id": user_id,
            "username": f"user_{user_id[:8]}",  # Generate username from user_id
            "questionnaire": answers,
            "role": answers.get("role"),
            "reading_style": answers.get("reading_style", []),
            "reading_time": answers.get("reading_time", []),
            "reading_supports": answers.get("reading_supports", []),
            "reading_challenges": answers.get("reading_challenges", []),
            "created_at": now,
            "updated_at": now
        }

        response = client_to_use.table("profiles").upsert(profile_data).execute()

        print("[✅ Saved to Supabase]", response.data)

        # Still save to JSON for backward compatibility (optional)
        profile = _load_profile()
        profile["questionnaire"] = answers
        _save_profile(profile)
        shutil.copy("profile.json", "../frontend/public/profile.json")

        return jsonify({"msg": "questionnaire stored"})

    except Exception as e:
        import traceback
        print("❌ ERROR in /api/save-questionnaire:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile", methods=["GET"])
def get_profile():
    try:
        # Get user_id and access_token from query parameters
        user_id = request.args.get('user_id')
        access_token = request.args.get('access_token')

        print(f"[🔍 GET /api/profile] Querying for user_id: {user_id}")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Create authenticated Supabase client if access_token is provided
        if access_token:
            from supabase import create_client
            auth_supabase = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_KEY")
            )
            # Set the auth header for this request
            auth_supabase.postgrest.auth(access_token)
            client_to_use = auth_supabase
            print("[🔐 Using authenticated Supabase client]")
        else:
            client_to_use = supabase
            print("[⚠️ Using anonymous Supabase client - RLS may block this]")

        # Get from Supabase
        response = client_to_use.table("profiles").select("*").eq("id", user_id).execute()

        print(f"[🔍 Supabase response] data: {response.data}, count: {len(response.data) if response.data else 0}")

        if response.data and len(response.data) > 0:
            print(f"[✅ Loaded profile from Supabase] User: {user_id}")
            print(f"[📦 Profile data] {response.data[0]}")
            return jsonify(response.data[0])
        else:
            # No profile found in database, return empty
            print(f"[ℹ️ No profile found for user: {user_id}]")
            return jsonify({
                "questionnaire": {},
                "struggles": []
            })

    except Exception as e:
        import traceback
        print(f"[❌ ERROR in /api/profile]")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
#sign up - create new account
#receives email/pw from frontend
#create account in supabase auth
@app.route("/api/signup", methods=["POST"])
def signup():
    """Create a new user account"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        # Validate input
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Create user in Supabase Auth
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        print(f"[✅ User created] {response.user.id}")
        print(f"[🔍 Session exists?] {response.session is not None}")
        if response.session:
            print(f"[🔐 Access token] {response.session.access_token[:20]}...")
        else:
            print(f"[⚠️ No session created - email confirmation might be enabled]")

        return jsonify({
            "msg": "Account created successfully",
            "user_id": response.user.id,
            "email": response.user.email,
            "access_token": response.session.access_token if response.session else None
        }), 201
        
    except Exception as e:
        import traceback
        print("❌ ERROR in /api/signup:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

#login - authenticate user
@app.route("/api/login", methods=["POST"])
def login():
    """Login an existing user"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        # Validate input
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Sign in with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        print(f"[✅ User logged in] {response.user.id}")
        
        return jsonify({
            "msg": "Login successful",
            "user_id": response.user.id,
            "email": response.user.email,
            "access_token": response.session.access_token
        }), 200
        
    except Exception as e:
        import traceback
        print("❌ ERROR in /api/login:")
        traceback.print_exc()
        return jsonify({"error": "Invalid email or password"}), 401

#helper to turn saved questionnaire into short context string
def _profile_context() -> str:
    """Return a compact, human-readable summary of the questionnaire."""
    profile = _load_profile()
    q = profile.get("questionnaire", {})
    if not q:
        return ""                       # nothing yet

    key_map = {
        "role":           "Role",
        "reading_style":  "Prefers",
        "reading_time":   "Typical session lasts this amount of time",
        "reading_supports": "Helpful supports",
        "reading_challenges": "Challenges"
        # add more keys as you create them
    }

    lines = []
    for k, label in key_map.items():
        v = q.get(k)
        if v:
            if isinstance(v, list):
                lines.append(f"{label}: {', '.join(v)}")
            else:
                lines.append(f"{label}: {v}")
    return "\n".join(lines)
# -----------------------------------------
#matcha-tts --- Commented out
#os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = "C:\\Program Files\\eSpeak NG\\libespeak-ng.dll"

#whisper
# Hardcode ffmpeg path for Whisper to find it
#os.environ["PATH"] += os.pathsep + r"C:\Users\sonja\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin"
#model = whisper.load_model("base")  # Load the Whisper model


@app.route("/") #defines home route like homepage of server
def home():
    return jsonify(message="Flask backend is running!") 


@app.route("/api/hello")
def hello():
    return "👋 Hello!"

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

    try:
        doc = fitz.open(filepath)
        raw_text = "\n".join([page.get_text() for page in doc])
        doc.close()
        os.remove(filepath)

        # Split lines, extract title
        lines = [line.strip() for line in raw_text.strip().splitlines() if line.strip()]
        title = lines[0] if lines else "Untitled"
        combined = "\n".join(lines[1:]) if len(lines) > 1 else ""

        # Split paragraphs (double newlines or quotes)
        raw_paragraphs = re.split(r'\n\s*\n|(?=\n["“])', combined)

        # Replace inner line breaks with space to fix weird splits like "With\na smile"
        paragraphs = [
            re.sub(r"\s*\n\s*", " ", p).strip()
            for p in raw_paragraphs if p.strip()
        ]

        # Replace all internal newlines with spaces before splitting
        cleaned_text = combined.replace("\n", " ")

        # Naively split paragraphs by sentence breaks for now
        # can improve this later using NLP or by detecting longer pauses
        raw_paragraphs = re.split(r'(?<=[.?!])\s+(?=[A-Z“"])', cleaned_text)

        paragraphs = [p.strip() for p in raw_paragraphs if p.strip()]

        print("[PARAGRAPHS]", paragraphs)

        return jsonify({
            "text": raw_text,
            "title": title,
            "paragraphs": paragraphs
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



#generating quiz questions
@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    # Rate limiting check
    if not gemini_rate_limiter.is_allowed():
        return jsonify({
            "error": "Too many requests. Gemini API rate limit (10 per minute). Please wait a moment and try again."
        }), 429
    
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
    raw = call_gemini(q_prompt, temperature = 0.3)
    
    # Check if we got an error message
    if "Error:" in raw:
        return jsonify({"error": raw}), 429

    questions = [line.strip().split(". ", 1)[-1]
                 for line in raw.strip().split("\n")
                 if line.strip() and line.strip()[0].isdigit()]

    return jsonify({"questions": questions})

#submiting answer
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    # Rate limiting check
    if not gemini_rate_limiter.is_allowed():
        return jsonify({
            "error": "Too many requests. Gemini API rate limit (10 per minute). Please wait a moment and try again."
        }), 429
    
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

    feedback = call_gemini(fb_prompt, temperature = 0.3)
    
    # Check if we got an error message
    if "Error:" in feedback:
        return jsonify({"error": feedback}), 429

    return jsonify({"feedback": feedback})

#helper function to send message to local websocket server -- commented out since for matcha
# async def send_tts_message(text):
#     uri = "ws://localhost:1000"
#     async with websockets.connect(uri) as websocket:
#         message = {"text": text}
#         message_json = json.dumps(message)
#         await websocket.send(message_json)
#         print(f"Sent: {message_json})")

#         response = await websocket.recv()
#         print(f"Received: {response}")
#         return response


#new matcha-tts clarity tags (replaced with google cloud tts)
@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get("text", "")[:1000]  # safety limit
    print("🔊 Google TTS receives:", text)

    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE,
            name="en-US-Wavenet-F"  #specific voice option, we can change this around
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        output_path = os.path.join("temp", "tts_output.mp3")
        os.makedirs("temp", exist_ok=True)
        with open(output_path, "wb") as out:
            out.write(response.audio_content)

        print(f"✅ Audio saved at {output_path}")
        return send_file(output_path, mimetype="audio/mpeg", as_attachment=False)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


#clarify text for matcha-tts
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
        "Return only the revised text with !word! tags. Do not explain or comment. Do NOT start with phrases like 'Here is the revised text'"
    )

    clarified_text = call_gemini(clarity_prompt, temperature = 0.3).strip()

    # Clean up unexpected bold or double !! if present
    #sometimes the model might return text with **bold** or !!double exclamations!!
    clarified_text = clarified_text.replace("**", "").replace("!!", "!")

    print("[CLARIFIED TEXT]", clarified_text)
    print("[ORIGINAL TEXT]", input_text)

    return jsonify({"text": clarified_text})

#whisper
#@app.route('/api/transcribe-audio', methods=['POST'])
#def transcribe_audio():
#    file = request.files['audio']
#    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
#        file.save(temp.name)
#        result = model.transcribe(temp.name)
#        transcription = result['text']
#    return jsonify({'transcription': transcription})

#google cloud stt
@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
            
        file = request.files['audio']
        print(f"🎤 Received audio file: {file.filename}")
        
        #Reading into memory instead of into a file
        audio_content = file.read()
        print(f"📊 Audio file size: {len(audio_content)} bytes")
        
        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code="en-US",
            enable_automatic_punctuation=True,
        )
        
        audio = speech.RecognitionAudio(content=audio_content)
        
        print("🔄 Sending to Google Speech-to-Text")
        response = stt_client.recognize(config=config, audio=audio)
        
        transcription = ""
        if response.results:
            for result in response.results:
                if result.alternatives:
                    transcription += result.alternatives[0].transcript + " "
            transcription = transcription.strip()
        
        if not transcription:
            transcription = "No speech detected"
            
        print(f"✅ Transcription: {transcription}")
        return jsonify({'transcription': transcription})

    except Exception as e:
        print("❌ STT Error:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

#qa assistant .tsx page
# Free-form QA assistant based on uploaded story
@app.route('/api/qa-chat', methods=['POST'])
def qa_chat():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    user_question = data.get("question", "")

    #pull user context 
    learner_ctx = _profile_context()

    chat_prompt = f"""
You are an assistant that answers reading-comprehension questions for children aged 7-10.
Use only the information from the provided story. Do not summarize the story if the user asks.
If the user asks to summarize, politely decline and say you can only answer questions about the story.
Your role is to answer reading comprehension questions based on the following user profile in mind
to tailor explanations:


=== Learner profile ===
{learner_ctx or "No profile data yet."}
=======================


Story:
\"\"\"{story}\"\"\"


Question: {user_question}

Answer:
"""
    answer = call_gemini(chat_prompt, temperature = 0.3)
    

    return jsonify({"answer": answer})

#api call for definition feature on extracted text page
@app.route("/api/define", methods=["POST"])
def define_word():
    data = request.get_json()
    story = data.get("text", "")[:1500]
    word = data.get("word", "").strip()

    if not word:
        return jsonify({"error": "No word provided"}), 400

    prompt = f"""
You are a friendly English tutor for children aged 7–10.

Below is a story and a word that appears in it. Explain what the word means in the context of the story, using simple language that a child would understand.

Word: "{word}"

Story:
\"\"\"{story}\"\"\" 

Your job:
- Give a short, clear definition of the word.
- Use examples or clues from the story if helpful.
- Do not explain all possible meanings — only what it means in this story.
- Keep it friendly, simple, and just 1–2 short sentences.

Answer:

"""
    result = call_gemini(prompt, temperature = 0.3)

    return jsonify({"definition": result.strip()})

# route for calling gemini tts
@app.route("/api/tts-gemini", methods=["POST"])
def tts_gemini():
    """
    JSON body:
    {
      "text": "Say cheerfully: Have a wonderful day!",
      "voice": "Erinome"
    }
    Returns: audio/wav file bytes
    """
    try:
        data = request.get_json(force=True) or {}
        text = (data.get("text") or "").strip()
        voice = (data.get("voice") or "Erinome").strip()

        if not text:
            return jsonify({"error": "Missing 'text'"}), 400

        wav_bytes = tts_service.synthesize_tts(text, voice)

        return send_file(
            io.BytesIO(wav_bytes),
            mimetype="audio/wav",
            as_attachment=False,
            download_name="tts.wav",
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


#route for logging to flask focus
@app.route('/api/log-focus', methods=['POST'])
def log_focus():
    data = request.get_json()
    print(f"[FOCUS] {data['status']} at {data['timestamp']}")
    return jsonify({"status": "ok"})

@app.route('/api/upload-story', methods=['POST'])
def upload_story():
    user_id = request.form.get('user_id')
    title = request.form.get('title')
    file = request.files.get('pdf')
    if not user_id or not title or not file:
        return jsonify({'error': 'Missing required fields'}), 400
    story_id = str(uuid.uuid4())
    filename = f"{story_id}.pdf"
    filepath = os.path.join(STORY_STORAGE_PATH, filename)
    file.save(filepath)
    pdf_url = f"/api/download-story-pdf/{story_id}"
    created_at = datetime.utcnow().isoformat()
    # Insert into Supabase/Postgres
    # supabase.table('stories').insert({ ... })
    # For demo, store in a local dict or file
    # TODO: Replace with actual DB insert
    # Save metadata to a local file for demo
    meta = {
        'id': story_id,
        'user_id': user_id,
        'title': title,
        'pdf_url': pdf_url,
        'cover_url': '',
        'created_at': created_at
    }
    meta_path = os.path.join(STORY_STORAGE_PATH, f"{story_id}.json")
    with open(meta_path, "w") as f:
        import json
        json.dump(meta, f)
    return jsonify({'success': True, 'story': meta})

@app.route('/api/user-stories', methods=['GET'])
def user_stories():
    user_id = request.args.get('userId')
    stories = []
    for fname in os.listdir(STORY_STORAGE_PATH):
        if fname.endswith('.json'):
            with open(os.path.join(STORY_STORAGE_PATH, fname)) as f:
                import json
                meta = json.load(f)
                if meta.get('user_id') == user_id:
                    stories.append(meta)
    return jsonify({'stories': stories})

@app.route('/api/story-details', methods=['GET'])
def story_details():
    story_id = request.args.get('storyId')
    meta_path = os.path.join(STORY_STORAGE_PATH, f"{story_id}.json")
    if not os.path.exists(meta_path):
        return jsonify({'error': 'Story not found'}), 404
    with open(meta_path) as f:
        import json
        meta = json.load(f)
    # For demo, just return metadata. You can add text extraction, images, etc.
    return jsonify(meta)

@app.route('/api/download-story-pdf/<story_id>', methods=['GET'])
def download_story_pdf(story_id):
    filepath = os.path.join(STORY_STORAGE_PATH, f"{story_id}.pdf")
    if not os.path.exists(filepath):
        return "File not found", 404
    return send_file(filepath, as_attachment=True)

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) #allows to run external connections (for deployment)