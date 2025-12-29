from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from langchain_runner.rag_chain import answer_with_context, add_pdf_to_vectorstore
from dotenv import load_dotenv
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class RequestBody(BaseModel):
    intent: str
    style: str = "Formal"
    language: str = "English"
    history: list[ChatMessage] = []  # 对话历史


DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


@app.post("/write")
async def generate_text(body: RequestBody):
    logger.info(
        f"[API] /write intent='{body.intent[:80]}' history={len(body.history)} lang={body.language} style={body.style}"
    )
    reply, sources = answer_with_context(body.intent, body.language, body.style)
    logger.info(f"[API] /write reply_len={len(reply)} sources={len(sources)}")
    return {"reply": reply, "sources": sources}


@app.post("/upload_pdf")
async def upload_pdf(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 PDFs allowed.")

    results = []
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF.")
        file_bytes = await file.read()
        try:
            chunk_count = add_pdf_to_vectorstore(file_bytes, file.filename)
            logger.info(f"[API] /upload_pdf file={file.filename} chunks={chunk_count}")
            results.append({"file": file.filename, "chunks": chunk_count})
        except Exception as e:
            logger.error(f"Failed to ingest PDF {file.filename}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Ingest failed for {file.filename}: {e}")

    return {"status": "ok", "files": results}
