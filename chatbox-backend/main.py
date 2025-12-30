from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from langchain_runner.qa import answer_with_context
from langchain_runner.vectorstore import add_pdf_to_vectorstore, delete_pdfs
from langchain_runner.summarize import summarize_all_docs
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


class DeleteRequest(BaseModel):
    files: list[str]


class SummaryRequest(BaseModel):
    style: str = "Formal"
    language: str = "English"


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
async def upload_pdf(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF.")

    file_bytes = await file.read()
    try:
        chunk_count = add_pdf_to_vectorstore(file_bytes, file.filename)
        logger.info(f"[API] /upload_pdf file={file.filename} chunks={chunk_count}")
    except Exception as e:
        logger.error(f"Failed to ingest PDF {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingest failed for {file.filename}: {e}")

    return {"status": "ok", "file": file.filename, "chunks": chunk_count}


@app.post("/delete_files")
async def delete_files(body: DeleteRequest):
    if not body.files:
        raise HTTPException(status_code=400, detail="No files provided.")
    deleted = delete_pdfs(body.files)
    logger.info(f"[API] /delete_files files={body.files} deleted={deleted}")
    return {"status": "ok", "deleted": deleted}


@app.post("/summarize")
async def summarize(body: SummaryRequest):
    logger.info(f"[API] /summarize lang={body.language} style={body.style}")
    reply = summarize_all_docs(body.language, body.style)
    logger.info(f"[API] /summarize reply_len={len(reply)}")
    return {"reply": reply}
