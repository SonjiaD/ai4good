# 📚 ReadingBuddy.AI

An **AI-powered reading companion** designed to support neurodivergent children aged 7–10. Children can upload stories, listen to them using AI-generated speech, answer comprehension questions, highlight words for vocabulary help, and receive friendly, personalized feedback—all powered by local and cloud-based AI models.

---
## 🔗 Additional Links

- **YouTube Presentation**: [Watch Our Demo](https://www.youtube.com/watch?v=IzJGKTbb9VY)
- **Slide Deck**: [Slides](https://docs.google.com/presentation/d/1kwzcAqwsPFRZ223iXDrsqG7W1z3u-UjGa139fp5wK6g/edit?usp=sharing)
---

## ✨ Key AI Features

- **📖 Story Upload + Segmentation**  
  Automatically splits longer stories into manageable sections to reduce cognitive overload.

- **🗣️ Text-to-Speech (TTS)**  
  High-quality voice generation using **Matcha-TTS**, with optional **speech clarity enhancements** for minimal pairs (e.g., “pill” vs. “peel”).

- **🧠 Reading Comprehension Assistant**  
  Generates story-specific questions using LLMs. Supports both multiple choice and open-ended formats.

- **🎯 Personalized Feedback Chatbot**  
  Friendly, age-appropriate chatbot gives encouragement and corrections based on the child's answers and their learning profile.

- **📚 Vocabulary Lookup**  
  Highlight any word in the story and ask the AI for a simple definition in the context of the story.

- **🧠 In-Context Learning with Learner Profiles**  
  Questionnaire responses are saved and used to tailor chatbot responses (e.g., adapting for ADHD, dyslexia, auditory processing disorder, etc.).

- **👀 Focus Tracker**  
  Combines mouse activity + webcam detection to gently track user attention during reading.

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
pip install flask flask-cors langchain gtts matcha-tts langchain-community pymupdf
```

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


