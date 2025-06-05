# initialize_chroma.py
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.docstore.document import Document
import os, json

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-MiniLM-L3-v2"
)

docs = []

TEMPLATE_DIR = "./templates"  

for filename in os.listdir(TEMPLATE_DIR):
    if filename.endswith(".json"):
        with open(os.path.join(TEMPLATE_DIR, filename)) as f:
            data = json.load(f)
            content = data.get("content", "") or json.dumps(data, ensure_ascii=False)
            docs.append(Document(page_content=content, metadata={"filename": filename}))

# 存入 Chroma
Chroma.from_documents(documents=docs, embedding=embedding, persist_directory="./chroma_db")