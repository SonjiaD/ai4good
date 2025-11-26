# 📚 ReadingBuddy.AI

An **AI-powered reading companion** designed to support neurodivergent children aged 7–10. Children can upload stories, listen to them using AI-generated speech, answer comprehension questions, highlight words for vocabulary help, and receive friendly, personalized feedback—all powered by local and cloud-based AI models.

---
## 🔗 Links

- **Figma Design**: [Prototype](https://www.figma.com/design/j9fPMIz8Y2nxVmJYDB1hnc/ReadingBudd?node-id=0-1&t=PKDubu9j2tPs6nMM-1)
- **YouTube Presentation:** [Watch our demo](https://www.youtube.com/watch?v=GFatDhgMKdcI)
- **Slide Deck**: [Slides](https://docs.google.com/presentation/d/1kwzcAqwsPFRZ223iXDrsqG7W1z3u-UjGa139fp5wK6g/edit?usp=sharing)
---

## ✨ Key AI Features

- **📖 Story Upload + Segmentation**
  Automatically splits longer stories into manageable sections using **PyMuPDF** for PDF processing.

- **🗣️ Text-to-Speech (TTS)**
  High-quality voice generation using **Google Cloud Text-to-Speech API**. Stories are split sentence-by-sentence with prefetching for seamless playback without pauses.

- **🎤 Speech-to-Text (STT)**
  Voice input support using **Google Cloud Speech-to-Text API** for interactive reading exercises.

- **🧠 Reading Comprehension Assistant**
  Generates story-specific comprehension questions using **Google Gemini API**. Supports both multiple choice and open-ended formats.

- **🎯 Personalized Feedback Chatbot**
  Friendly, age-appropriate feedback powered by **Google Gemini API**, tailored to the child's answers and learning profile.

- **📚 Vocabulary Lookup**
  Highlight any word in the story and get AI-generated, context-aware definitions using **Google Gemini API**.

- **🎨 Story Illustration Generation**
  Generate kid-friendly illustrations from story text using **OpenAI API**. 
  - Default Model: `gpt-image-1` (configurable via `IMAGE_MODEL` env variable)
  - Supports: DALL-E 3, or other OpenAI image models
  - Images are tagged with kid-friendly prompts (simple shapes, soft colors, no violence)

- **🧠 In-Context Learning with Learner Profiles**
  Questionnaire responses stored in **Supabase** database and used to tailor AI responses (e.g., adapting for ADHD, dyslexia, auditory processing disorder, etc.).

- **👀 Focus Tracker**
  Uses **MediaPipe Face Landmarker** via webcam + mouse activity tracking to gently monitor user attention during reading.

---

## 🔑 AI APIs & Services Used

### Required API Keys

The production version uses the following cloud-based AI services:

| Service | Purpose | API Key Required | Free Tier Limits |
|---------|---------|------------------|------------------|
| **Google Cloud Text-to-Speech** | Story narration (TTS) | `GOOGLE_API_KEY` or service account credentials | 1M characters/month |
| **Google Cloud Speech-to-Text** | Voice input (STT) | Service account credentials (`GOOGLE_TTS_CREDENTIALS_PATH`) | 60 min/month |
| **Google Gemini API** | Quiz generation, feedback, definitions | `GOOGLE_API_KEY` | 15 requests/min, 1500/day |
| **OpenAI API** | Story illustrations (Image Generation) | `OPENAI_API_KEY` | Pay-per-use ($0.04/image with DALL-E 3) |
| **Supabase** | Database & authentication | `SUPABASE_URL`, `SUPABASE_KEY` | 500MB database, 50K auth users |

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Google Cloud APIs
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_TTS_CREDENTIALS_PATH=./google-credentials.json

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Image Generation Model (Optional)
# Supported models: gpt-image-1, dall-e-3, etc.
# Default: gpt-image-1
IMAGE_MODEL=gpt-image-1

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

**Image Model Configuration:**
- `IMAGE_MODEL`: Controls which OpenAI image generation model to use
  - `gpt-image-1` (default): Fast, cost-effective
  - `dall-e-3`: Higher quality, more expensive
  - Other OpenAI image models as available
- Change this in `.env` and restart the backend to use a different model

### Google Cloud Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Text-to-Speech API** and **Cloud Speech-to-Text API**
4. Create a service account and download the JSON key file
5. Save it as `google-credentials.json` in the `backend/` folder

### API Rate Limit Considerations

- **Google Cloud TTS**: Sentence-by-sentence playback stays well within free tier limits
- **Google Gemini**: Free tier allows ~15 requests/minute - sufficient for quiz generation
- **OpenAI DALL-E**: Pay-per-use, but images are generated on-demand and cached

---

## 🧩 Project Versions

| Folder                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `streamlit_app/`         | Lightweight prototype with Streamlit, Matcha-TTS, and Ollama (local LLM)    |
| `frontend/ + backend/`   | Full-stack production-ready version (React + Flask), with persistent profiles and modular components |

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

ReadingBuddy.AI uses [Matcha-TTS](https://github.com/chocobearz/Matcha-TTS-L2-clarity/tree/main/matcha) for speech clarity, especially for minimal pairs (e.g. “pill” vs “peel”).

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


