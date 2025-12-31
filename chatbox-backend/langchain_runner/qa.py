import logging
import re
from typing import List, Tuple

from langchain_core.documents import Document

from .chains import qa_chain
from .vectorstore import retriever

logger = logging.getLogger(__name__)


def answer_with_context(question: str, language: str, style: str) -> Tuple[str, List[dict]]:
    if not question.strip():
        return "please provide a valid question", []

    # Prefer standard retriever API when available; fallback to invoke for LCEL retrievers.
    docs: List[Document] = (
        retriever.invoke(question)
        if hasattr(retriever, "invoke")
        else retriever.get_relevant_documents(question)
    )
    if not docs:
        return "I cannot find the answer in the provided documents.", []
    context = "\n\n".join(doc.page_content for doc in docs)
    logger.info(f"[QA] retrieved {len(docs)} docs for question: {question[:80]}")

    result = qa_chain.invoke({"question": question, "context": context, "language": language, "style": style}).strip()

    # 🔒 Guardrail：如果没有引用 page，拒答 (allow localized markers)
    citation_patterns = [
        r"(?:\(|（)\s*page\s*\d+",
        r"(?:\(|（)\s*p\.\s*\d+",
        r"(?:\(|（)?\s*第?\s*\d+\s*页",
        r"(?:\(|（)?\s*side\s*\d+",
        r"(?:\(|（)?\s*seite\s*\d+",
        r"page\s*\d+",
        r"p\.\s*\d+",
        r"第\s*\d+\s*页",
        r"side\s*\d+",
        r"seite\s*\d+",
    ]
    if not any(re.search(pattern, result, flags=re.IGNORECASE) for pattern in citation_patterns):
        return "I cannot find the answer in the provided documents.", []

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
