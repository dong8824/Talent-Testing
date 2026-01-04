import requests
import json

print("Testing Backend Server at http://localhost:8000/chat...")

try:
    response = requests.post(
        "http://localhost:8000/chat",
        json={"message": "Hello from test script"},
        timeout=30
    )
    
    if response.status_code == 200:
        print("Success! Server replied:")
        print(response.json())
    else:
        print(f"Failed with status {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Connection Error: {e}")
    print("Is the backend server running?")
