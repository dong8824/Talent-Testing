import os
from openai import OpenAI
from dotenv import load_dotenv

# Load env vars
load_dotenv()

api_key = os.getenv("ALIYUN_API_KEY")
base_url = os.getenv("ALIYUN_API_BASE")
model_name = os.getenv("ALIYUN_MODEL_NAME")

print(f"Testing connection to: {base_url}")
print(f"Model: {model_name}")
print(f"API Key: {api_key[:6]}...{api_key[-4:]}")

client = OpenAI(
    api_key=api_key,
    base_url=base_url,
)

try:
    print("\nSending request to DeepSeek...")
    completion = client.chat.completions.create(
        model=model_name,
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Hello, who are you?'}
        ]
    )
    print("\nSuccess! Response:")
    print(completion.choices[0].message.content)
except Exception as e:
    print("\nConnection Failed!")
    print(f"Error: {e}")
