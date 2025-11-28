# 📚 ReadingBudd.AI - Personalized Reading Companion for Neurodivergent Learners

An **AI-powered reading companion** designed to support neurodivergent children aged 7–10. ReadingBudd.AI originated from the **AI4Good Lab** (Mila, May-June 2025), a 2-month program for women and underrepresented genders in machine learning. The project has since evolved with **RBC Borealis mentorship** (2025), adding enhanced API resilience, quota management, and security hardening.

## 🎯 The Problem We're Solving

Learning isn't one-size-fits-all, especially for neurodivergent students (ADHD, ASD, dyslexia). Traditional classroom settings often overwhelm these learners, leading to cognitive overload, frustration, and disengagement. Many online reading tools are paywalled, rigid, and contribute to further cognitive overload.

**The Result:** Students with unique learning needs are left behind, particularly in under-resourced school districts, creating a major equity issue in Canadian classrooms.

**Our Vision:** An affordable, adaptable tool that actively adapts to how each student processes, understands, and retains information—turning "I'm just bad at reading" into "I get it now."

---

## 🔗 Resources & Links

- **AI4Good Lab Pitch**: [ReadingBudd.AI Project Pitch @ AI4GoodLab Demo Day](https://github.com/SonjiaD/ai4good)
- **Figma Design**: [Interactive Prototype](https://www.figma.com/design/j9fPMIz8Y2nxVmJYDB1hnc/ReadingBudd?node-id=0-1&t=PKDubu9j2tPs6nMM-1)
- **YouTube Demo**: [Watch our presentation](https://www.youtube.com/watch?v=GFatDhgMKdcI)
- **Slide Deck**: [Full Presentation](https://docs.google.com/presentation/d/1kwzcAqwsPFRZ223iXDrsqG7W1z3u-UjGa139fp5wK6g/edit?usp=sharing)
- **GitHub Repository**: [Full Codebase](https://github.com/SonjiaD/ai4good)
---

## ✨ Core Features

### Story & Content Management
- **📖 PDF Story Upload + Smart Segmentation** - Automatically splits stories into manageable sections using **PyMuPDF**, with clean formatting and page detection for optimal reading experience

- **🎨 AI-Generated Story Illustrations** - Creates kid-friendly visual accompaniments to story pages using **OpenAI Image Generation API (`gpt-image-1` model)**, with dynamic image URL routing supporting both local and production environments

### Adaptive Learning & Personalization
- **🧠 Belief State Model** - Stores learner preferences and needs from onboarding survey (e.g., "requires step-by-step explanations", "prefers visual support") to guide all AI responses

- **📊 Behavioral Logging** - Tracks reading time, quiz accuracy, modality preferences, and engagement patterns to continuously refine personalization and adapt content difficulty in real-time

### Comprehension & Feedback
- **🧠 AI Reading Comprehension Questions** - Generates story-specific quizzes using **Google Gemini API** with rate limiting (10 calls/60s) and automatic retry logic for resilience

- **🎯 Personalized Feedback** - Friendly, age-appropriate responses tailored to learner profile and answer accuracy, delivered via text or audio

- **📚 Context-Aware Vocabulary Lookup** - Highlight any word and receive AI-generated definitions that consider the story context and learner's reading level

### Multimodal Interaction
- **🗣️ Text-to-Speech (TTS)** - High-quality child-friendly voice generation using **Matcha-TTS** (for minimal pair clarity) and **Google Cloud Text-to-Speech API**, with sentence-by-sentence playback and prefetching for seamless audio without pauses

- **🎤 Speech-to-Text Input (STT)** - Voice-based Q&A sessions via **Google Cloud Speech-to-Text API**, offering a smoother experience for students who prefer speaking over typing

- **👀 Focus Tracking** - Uses **MediaPipe Face Landmarker** via webcam + mouse activity tracking to monitor engagement during reading and provide gentle support when attention drifts

### Cognitive Accessibility
- **⚙️ Adaptive Interface** - React + TypeScript frontend designed with neurodivergent users in mind, minimizing cognitive overload through clear layouts and flexible interaction modalities

- **🔧 Support Strategy Adjustment** - System dynamically adjusts difficulty, support strategies, and content presentation based on behavioral signals (pacing, engagement, quiz performance)

---

## 🎓 Project History: AI4Good Lab → RBC Borealis

### AI4Good Lab (May-June 2025)
ReadingBudd.AI was prototyped during **AI4Good Lab**, a 2-month program hosted by Mila for women and underrepresented genders in machine learning. 

**Month 1**: Foundational ML concepts (supervised/unsupervised learning, neural networks, CNNs, RNNs, reinforcement learning)

**Month 2**: 3-week sprint to build AI projects for social good, where ReadingBudd.AI was born with:
- PDF story upload and formatting
- Matcha-TTS for child-friendly audio
- Whisper ASR for voice-based input
- LLaMA-generated comprehension quizzes
- Vocabulary lookup and Q&A assistant
- Belief state model for personalization
- Cognitively accessible React + TypeScript interface

**Key Innovation**: Instead of building models from scratch, we integrated powerful existing tools to build functionality effectively, focusing on responsible, accessible design.

### RBC Borealis Enhancement (November 2025)
With RBC Borealis mentorship, we've hardened the production stack with enterprise-grade reliability and security:

#### 🔐 Security & Reliability Improvements
- **✅ API Key Protection** - All credentials stored in `.env` files, properly gitignored, zero hardcoded secrets
- **✅ Environment-Based Configuration** - Frontend auto-detects API URL (localhost vs production)
- **✅ Rate Limiter** - Prevents Gemini API quota exhaustion with sliding window (10 calls/60s, safe below 15 RPM limit)
- **✅ Exponential Backoff Retry Logic** - Automatic retries on 429 errors with delays (1s, 2s, 4s)
- **✅ API Key Rotation Support** - Easy switching between primary and backup keys via `.env`

#### 🚀 Production Deployment Enhancements
- **✅ Dynamic Image URLs** - Fixed hardcoded `localhost` URLs to work in both local and production environments (`localhost:5000` → `ai4good.onrender.com`)
- **✅ Image Caching** - Generated illustrations stored and reused for same story pages
- **✅ Async Image Processing** - `/api/images/story/async` endpoint for long-running jobs
- **✅ Optimized Image Size** - 512x512 resolution balances quality and generation speed

#### 📊 Roadmap Going Forward
- **ML Personalization**: Integrate behavioral signals to dynamically adjust difficulty and support strategies
- **Real-World Testing**: Collaborate with educators and students for feedback and validation
- **Dataset Expansion**: Incorporate curated reading comprehension sets beyond LLM outputs
- **Advanced Adaptations**: Confusion detection, simplified prompts, real-time support actions
- **Ranking Models**: Convert behavioral signals into recommended support strategies

---

## 🔑 AI APIs & Services Used

### Current Tech Stack

| Service | Purpose | Status | Free Tier |
|---------|---------|--------|-----------|
| **Google Gemini API** | Quiz generation, feedback, definitions | ✅ Production | 15 req/min, 1500/day |
| **Google Cloud TTS** | Story narration | ✅ Production | 1M characters/month |
| **Google Cloud STT** | Voice input | ✅ Production | 60 min/month |
| **OpenAI Image API** | Story illustrations (`gpt-image-1`) | ✅ Production | Pay-per-use |
| **Matcha-TTS** | Child-friendly voice clarity | ✅ Local/Fallback | Open source |
| **Supabase** | User profiles & data | 🚧 Optional | 500MB database |
| **MediaPipe** | Focus tracking | ✅ Optional | Open source |
| **PyMuPDF** | PDF processing | ✅ Production | Open source |
| **Whisper ASR** | Speech recognition | ✅ Prototype | OpenAI API key |

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Google Cloud APIs
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_TTS_CREDENTIALS_PATH=./google-credentials.json

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### Google Cloud Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Text-to-Speech API** and **Cloud Speech-to-Text API**
4. Create a service account and download the JSON key file
5. Save it as `google-credentials.json` in the `backend/` folder

### API Rate Limit Management (RBC Borealis Enhancement)

**Google Gemini Free Tier Limits:**
- Rate Limit: 15 requests per minute (RPM)
- Daily Limit: 1,500 requests per day (RPD)

**Our Implementation:**
- **Client-side Rate Limiter**: Limited to 10 calls/60 seconds (safe margin below 15 RPM)
  - Uses sliding window algorithm
  - Returns 429 (Too Many Requests) when exceeded
  - Prevents quota exhaustion in high-traffic scenarios

- **Automatic Retry Logic**: Exponential backoff on rate limit errors
  - Retry 1: Wait 1 second, retry
  - Retry 2: Wait 2 seconds, retry
  - Retry 3: Wait 4 seconds, give up
  - Returns friendly error message to user if all retries fail

- **Backup API Key Support**: Easy switching between primary and backup keys
  - Update `GOOGLE_API_KEY` in `.env` if quota exhausted
  - No code changes required

**Protected Endpoints:**
- `/api/generate-quiz` - Quiz generation
- `/api/submit-answer` - Answer feedback

**Other API Considerations:**
- **Google Cloud TTS**: Sentence-by-sentence playback stays well within free tier
- **OpenAI Image API**: Pay-per-use with `gpt-image-1` model, images generated on-demand and cached locally
- **Image generation**: Dynamic URLs work in both local (`http://localhost:5000`) and production (`https://ai4good.onrender.com`) environments
- **Image optimization**: Default 512x512 resolution for faster generation; supports 1024x1024, 1024x1536, 1536x1024

---

## 🧩 Project Versions

| Folder                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `streamlit_app/`         | Lightweight prototype with Streamlit, Matcha-TTS, and Ollama (local LLM)    |
| `frontend/ + backend/`   | Full-stack production-ready version (React + Flask), with persistent profiles and modular components |

---

## 🔧 Architecture Overview

### System Design

**Frontend (React + TypeScript)**
- Responsive UI designed for neurodivergent users (minimal cognitive overload)
- Auto-detects backend URL (localhost for development, render.com for production)
- Real-time audio playback with prefetching for seamless experience
- Story reading interface with page navigation and illustration display
- Quiz submission with immediate feedback
- Vocabulary lookup with context-aware definitions
- Voice input option via Speech-to-Text
- Focus tracker with webcam integration (optional)

**Backend (Flask + Python)**
- RESTful API for all AI operations
- Rate limiter with sliding window algorithm (10 calls/60s for Gemini)
- Exponential backoff retry logic for API resilience
- Belief state model management (user preferences and learning patterns)
- Dynamic image URL generation supporting both local and production environments
- User profile management with Supabase
- Behavioral logging for personalization
- Async job queue for long-running image generation

### Key Technical Innovations (RBC Borealis)

#### 1. Rate Limiter Implementation (`backend/app.py`)
```python
class RateLimiter:
    def __init__(self, max_calls: int = 10, time_window: int = 60):
        self.max_calls = max_calls      # 10 calls
        self.time_window = time_window  # per 60 seconds
        self.calls = deque()            # sliding window
    
    def is_allowed(self) -> bool:
        now = time.time()
        # Remove calls outside time window
        while self.calls and self.calls[0] < now - self.time_window:
            self.calls.popleft()
        
        # Check if under limit
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False

# Usage in endpoints
gemini_rate_limiter = RateLimiter(max_calls=10, time_window=60)

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    if not gemini_rate_limiter.is_allowed():
        return jsonify({'error': 'Too many requests. Try again later.'}), 429
    # ... proceed with quiz generation
```

#### 2. Exponential Backoff Retry Logic (`backend/app.py`)
```python
def call_gemini(prompt, max_retries=3):
    """Call Gemini API with automatic retry on rate limit."""
    for attempt in range(max_retries):
        try:
            response = gemini_model.generate_content(prompt)
            return response.text
        except ResourceExhausted as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait_time)
            else:
                return f"Error: API quota exceeded. Please try again later."
        except Exception as e:
            return f"Error generating response: {str(e)}"

# Error responses returned to frontend as JSON
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    if not gemini_rate_limiter.is_allowed():
        return jsonify({'error': 'Rate limited. Please wait.'}), 429
    
    feedback = call_gemini(prompt)
    if 'Error' in feedback:
        return jsonify({'error': feedback}), 429
    return jsonify({'feedback': feedback})
```

#### 3. Dynamic Image URL Generation (`backend/app_story_images.py`)
```python
def file_url(filename, base_url):
    """Generate absolute URL for image files using request context."""
    return f"{base_url}/api/generated/{filename}"

def process_story_images(images, base_url):
    """Process story images with dynamic base URL."""
    for image in images:
        image['url'] = file_url(image['filename'], base_url)
    return images

# Extract base URL from request context
@app.route('/api/images/story', methods=['POST'])
def generate_story_images():
    base_url = request.host_url.rstrip('/')  # http://localhost:5000 or https://ai4good.onrender.com
    
    # ... generate images ...
    
    processed = process_story_images(images, base_url)
    return jsonify({'images': processed})

@app.route('/api/images/story/async', methods=['POST'])
def generate_story_images_async():
    base_url = request.host_url.rstrip('/')
    
    # ... queue async job ...
    
    return jsonify({'job_id': job_id, 'status': 'processing'})
```

**Result:**
- Local: `http://localhost:5000/api/generated/page1-20251126-145143.png`
- Production: `https://ai4good.onrender.com/api/generated/page1-20251126-145143.png`

### Data Privacy & Ethics

**Data Handling:**
- All API keys stored in `.env` files (never committed to git)
- User behavioral data logged locally for personalization
- Optional data storage based on user consent
- Compliant with CPPA (Consumer Privacy Protection Act - Bill C-27)

**Bias Mitigation:**
- Using curriculum-aligned texts across Canadian regions and grade levels
- Auditing AI outputs for cultural sensitivity and reading difficulty
- Designing prompts with input from educators and speech-language pathologists
- Continuous evaluation for inclusive and ethical AI outputs

---

## 🔧 Full-Stack Setup (React + Flask)

### 1. Clone the Repository

```bash
git clone https://github.com/SonjiaD/ai4good
cd ai4good
```

---

### 2. Backend Setup (Flask)

```bash
cd backend
python -m venv .venv
```

Activate the environment:

- **Windows**
  ```bash
  .venv\Scripts\activate
  ```

- **Mac/Linux**
  ```bash
  source .venv/bin/activate
  ```

Install dependencies:

```bash
pip install -r requirements.txt
```

**For production deployment**, use minimal dependencies:

```bash
pip install -r requirements-prod.txt
```

Create a `.env` file with your API keys (see [AI APIs section](#-ai-apis--services-used) above).

Run the server:

```bash
python app.py
```

The backend will be available at: `http://localhost:5000`

---

### 3. Frontend Setup (React + TypeScript)

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Your React app will be available at: `http://localhost:3000`

> ⚠️ Make sure the Flask backend is running in a separate terminal window!

---

## 🚀 Production Deployment

The application is deployed using:

- **Frontend**: [Vercel](https://vercel.com) - Deployed from `frontend/` directory
  - Live URL: `https://readingbuddy.vercel.app`
  - Auto-deploys from `main` branch on push
  - Uses `requirements-prod.txt` for optimized build

- **Backend**: [Render](https://render.com) - Deployed from `backend/` directory
  - API URL: `https://ai4good.onrender.com`
  - Auto-deploys from `main` branch on push
  - Free tier includes cold starts (~50s delay on first request)

### Deployment Configuration

**Backend (Render)**:
- Build Command: `pip install -r requirements-prod.txt`
- Start Command: `gunicorn app:app`
- Environment Variables: Set all API keys from `.env` in Render dashboard
- Add `google-credentials.json` as a Secret File

**Frontend (Vercel)**:
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Automatically detects and uses Node.js

---

## 🧪 Streamlit Prototype Setup

This prototype runs everything in a single Python app using local models and a simpler interface.

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/ReadingBuddyAI.git
cd ReadingBuddyAI
```

### 2. Create and Activate a Virtual Environment

```bash
python -m venv .venv
```

Activate it:

- **Windows**:
  ```bash
  .venv\Scripts\activate
  ```

- **Mac/Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` is missing:

```bash
pip install streamlit langchain langchain-community gtts matcha-tts
```

### 4. Install Ollama + Model

1. Download Ollama: https://ollama.com/download  
2. Pull a local model:

```bash
ollama pull llama3
```

### 5. Run Streamlit App

```bash
cd streamlit_app
streamlit run Home.py
```

Visit the app at: `http://localhost:8501`


---

## 🧠 Matcha-TTS Setup Guide (Windows Only)

ReadingBudd.AI uses [Matcha-TTS](https://github.com/chocobearz/Matcha-TTS-L2-clarity/tree/main/matcha) for speech clarity, especially for minimal pairs (e.g. “pill” vs “peel”).

### 🔗 Matcha-TTS GitHub Repo
- https://github.com/chocobearz/Matcha-TTS-L2-clarity/tree/main/matcha

### 🧰 Setup Instructions

1. **Install eSpeak NG**  
   Download from: https://github.com/espeak-ng/espeak-ng/releases  
   Locate the `libespeak-ng.dll` path (usually `C:\Program Files\eSpeak NG\libespeak-ng.dll`).

2. **Set environment variable (PowerShell):**

```powershell
$env:PHONEMIZER_ESPEAK_LIBRARY="C:\Program Files\eSpeak NG\libespeak-ng.dll"
```

3. **Activate virtual environment:**

```powershell
.venv310\Scripts\Activate
```

---

### 🧪 After Cloning Repo - Test Matcha-TTS via Terminal

**With Clarity:**

```bash
matcha-tts --text "Pass me the !peel! not the !pill!" --clarity 1 --play
matcha-tts --text "I heard them say !cooed! not !could!" --clarity 1 --play
matcha-tts --text "Unfortunately, the student's answer is not !correct!. According to the story, Luna liked to sit on the !windowsill! and watch the !waves! crash against the !rocks! every !morning!" --clarity 1 --play
```

**Without Clarity:**

```bash
matcha-tts --text "Pass me the peel not the pill" --play
matcha-tts --text "Unfortunately, the student's answer is not correct. According to the story, Luna liked to sit on the windowsill and watch the waves crash against the rocks every morning." --play
```

---


### ▶️ Run All Servers Windows Setup (Matcha-TTS + Flask + React)

#### 1. Frontend (React)

```bash
cd frontend
npm start
```

#### 2. Backend (Flask)

```powershell
.venv310\Scripts\Activate
cd backend
$env:PHONEMIZER_ESPEAK_LIBRARY="C:\Program Files\eSpeak NG\libespeak-ng.dll"
python app.py
```

#### 3. Matcha-TTS Server

```powershell
.venv310\Scripts\Activate
$env:PHONEMIZER_ESPEAK_LIBRARY="C:\Program Files\eSpeak NG\libespeak-ng.dll"
cd Matcha-TTS\matcha
python server.py
```

---


