# backend/app.py

from flask import Flask, request, jsonify 
from flask_cors import CORS
import os
import fitz

app = Flask(__name__) #creates new flask web application 
CORS(app)  # Allow requests from frontend
#makes sure frontend can talk to backend

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


def echo():
    data = request.get_json()
    return jsonify(response=f"You said: {data.get('message', '')}")

if __name__ == "__main__":
    app.run(debug=True)