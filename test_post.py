import requests

data = {
    "role": "Child",
    "reading_challenges": ["confusing letters", "skipping lines"],
    "reading_difficulties": "skipped"
}

res = requests.post("http://127.0.0.1:5000/api/save-questionnaire", json=data)

print("Status code:", res.status_code)
print("Response:", res.json())
