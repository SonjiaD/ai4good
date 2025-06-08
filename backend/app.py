# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route("/")
def home():
    return jsonify(message="Flask backend is running!")

@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.get_json()
    return jsonify(response=f"You said: {data.get('message', '')}")

if __name__ == "__main__":
    app.run(debug=True)
