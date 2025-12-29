from io import BytesIO
import logging
import os
from typing import List, Tuple

from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_deepseek import ChatDeepSeek
from langchain_huggingface import HuggingFaceEmbeddings
from pypdf import PdfReader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

embedding = HuggingFaceEmbeddings(model_name="intfloat/e5-small-v2")

try:
  persist_directory = "./chroma_db"
  vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embedding)
  retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
  logger.info("成功加载 Chroma 向量库")
except Exception as e:
  logger.error(f" 加载 Chroma 向量库失败: {e}")
  raise

prompt = PromptTemplate.from_template(
    """
You are a helpful assistant. Answer the question using ONLY the provided context.
If the answer is not in the context, say: "I cannot find the answer in the provided documents."

Respond in the requested language: {language}
Use the requested tone/style: {style}

Keep the answer concise and cite page numbers inline when relevant, e.g., (page 3).

Question: {question}

Context:
{context}
"""
)

try:
  llm = ChatDeepSeek(model="deepseek-chat", temperature=0.3, api_key=DEEPSEEK_API_KEY)
  llm_chain = LLMChain(llm=llm, prompt=prompt)
  logger.info("DeepSeek 模型初始化成功")
except Exception as e:
  logger.error(f" DeepSeek 模型初始化失败: {e}")
  raise


def add_pdf_to_vectorstore(file_bytes: bytes, filename: str) -> int:
    """Parse PDF bytes, split to chunks with page metadata, and store in Chroma."""
    reader = PdfReader(BytesIO(file_bytes))
    pages_text = [page.extract_text() or "" for page in reader.pages]
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

    texts: List[str] = []
    metadatas: List[dict] = []
    for idx, page_text in enumerate(pages_text, start=1):
        if not page_text.strip():
            continue
        chunks = splitter.split_text(page_text)
        for line_no, chunk in enumerate(chunks, start=1):
            texts.append(chunk)
            metadatas.append({"page": idx, "source": filename, "paragraph": line_no})

    if not texts:
        return 0

    vectorstore.add_texts(texts=texts, metadatas=metadatas)
    vectorstore.persist()
    logger.info(f"[PDF ingest] {filename} -> pages: {len(pages_text)}, chunks: {len(texts)}")
    return len(texts)


def answer_with_context(question: str, language: str, style: str) -> Tuple[str, List[dict]]:
    if not question.strip():
        return "please provide a valid question", []

    docs = retriever.get_relevant_documents(question)
    if not docs:
        return "I cannot find the answer in the provided documents.", []

    context = "\n\n".join(doc.page_content for doc in docs)
    logger.info(f"[QA] retrieved {len(docs)} docs for question: {question[:80]}")
    result = llm_chain.run(
        {"question": question, "context": context, "language": language, "style": style}
    ).strip()

    sources = []
    for idx, doc in enumerate(docs, start=1):
        para = doc.metadata.get("paragraph") or doc.metadata.get("line") or idx
        sources.append(
            {
                "page": doc.metadata.get("page", "?"),
                "source": doc.metadata.get("source", ""),
                "paragraph": para,
            }
        )
    return result, sources
