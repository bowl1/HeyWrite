from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestBody(BaseModel):
    intent: str
    style: str = "Formal"
    language: str = "English"

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


@app.post("/write")
async def generate_text(body: RequestBody):
    system_prompt = (
        "You are a professional writing assistant for workplace communication, capable of generating effective and practical text based on the user's intent and desired tone."
    )

    user_prompt = f"intent:{body.intent}\nstyle:{body.style}\nlanguage:{body.language}\nPlease generate a suitable text based on the information provided"

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        reply = result['choices'][0]['message']['content']
    except Exception as e:
        reply = f"Something went wrong: {str(e)}"

    return {"reply": reply}