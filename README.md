## 🛠️ Installation & Setup

Follow these steps to run the project locally.

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

Or if `requirements.txt` is missing:

```bash
pip install streamlit langchain langchain-community
```

### 4. Install Ollama and Pull a Model

1. Download Ollama from: https://ollama.com/download

2. Pull a model (e.g. LLaMA 3.2):

```bash
ollama pull llama3.2:3b
```

### 5. Run the App

```bash
streamlit run app.py
```

Visit in your browser:

```
http://localhost:8501
```
