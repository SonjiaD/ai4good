# 📚 ReadingBuddy.AI

An AI-powered reading companion designed for neurodivergent children. Children can read stories, listen to them with TTS, answer comprehension questions, and receive friendly feedback—all powered by AI models running locally or in the cloud.

---

## 🧩 Project Versions

| Version       | Description                               |
|---------------|-------------------------------------------|
| `streamlit_app/` | Rapid prototype with local TTS and LLM |
| `flask_react_app/` | Production-ready full-stack version (React + Flask API) |

---

## 🔧 Full-Stack Setup (Flask + React)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ReadingBuddyAI.git
cd ReadingBuddyAI
```

### 2. Backend Setup (Flask)

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

- **Windows**:
  ```bash
  python -m venv .venv
  .venv\Scripts\activate
  ```

- **Mac/Linux**:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

Install dependencies:

```bash
pip install flask flask-cors langchain gtts matcha-tts
```

Run the Flask server:

```bash
python app.py
```

The server will run on `http://localhost:5000`.

---

### 3. Frontend Setup (React + TypeScript)

> ⚠️ **Important**: The backend and frontend must be run in separate terminals.

Open a new terminal, then:

```bash
cd frontend
npm install
npm run dev
```

Your React app will run at `http://localhost:3000`.

---

## 🧪 Streamlit Prototype Setup

### 1. Clone the Repository

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

### 4. Install Ollama and Pull a Model

1. Download Ollama: https://ollama.com/download  
2. Pull a model:

```bash
ollama pull llama3
```

### 5. Run the Streamlit App

```bash
cd streamlit_app
streamlit run Home.py
```

Visit: `http://localhost:8501`

---

### 🗣️ Matcha-TTS Setup (Windows Only)

1. **Install eSpeak NG**  
   Download from: https://github.com/espeak-ng/espeak-ng/releases  
   Find and copy the path to `libespeak-ng.dll` (typically in `C:\Program Files\eSpeak NG\libespeak-ng.dll`).

2. **Set environment variable**

```powershell
$env:PHONEMIZER_ESPEAK_LIBRARY="C:\Program Files\eSpeak NG\libespeak-ng.dll"
```

> 🔁 You need to run this **every time** before using Matcha-TTS unless you add it to your permanent system environment variables.
