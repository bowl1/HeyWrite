import logging
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

    # 🔒 Guardrail：如果没有引用 page，拒答
    if "(page" not in result.lower():
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
