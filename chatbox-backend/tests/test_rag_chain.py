import importlib
import sys
from typing import List
from unittest.mock import MagicMock

import pytest
from langchain_core.documents import Document

# RAG behavior tests

@pytest.fixture()
def rag_chain(monkeypatch):
    stub_llm = MagicMock()
    stub_llm.predict.return_value = "stub answer"

    stub_llm_chain = MagicMock()
    stub_llm_chain.predict.return_value = "stub answer"

    stub_retriever = MagicMock()
    stub_retriever.get_relevant_documents.return_value = []

    stub_vectorstore = MagicMock()
    stub_vectorstore.as_retriever.return_value = stub_retriever
    stub_vectorstore.get.return_value = {"documents": [], "metadatas": []}

    monkeypatch.setattr(
        "langchain_runner.rag_chain.ChatDeepSeek",
        lambda *args, **kwargs: stub_llm
    )
    monkeypatch.setattr(
        "langchain_runner.rag_chain.HuggingFaceEmbeddings",
        lambda *args, **kwargs: MagicMock()
    )
    monkeypatch.setattr(
        "langchain_runner.rag_chain.Chroma",
        lambda *args, **kwargs: stub_vectorstore
    )
    monkeypatch.setattr(
        "langchain_runner.rag_chain.LLMChain",
        lambda *args, **kwargs: stub_llm_chain
    )

    sys.modules.pop("langchain_runner.rag_chain", None)
    module = importlib.import_module("langchain_runner.rag_chain")
    return module


def test_answer_contains_page_citation(monkeypatch, rag_chain):
    # mock retriever returns a fake doc
    fake_doc = Document(
        page_content="Canopy clustering is a fast clustering algorithm.",
        metadata={"page": 2, "source": "test.pdf"},
    )
    monkeypatch.setattr(
        rag_chain.retriever, "get_relevant_documents", lambda _question: [fake_doc]
    )

    # Mock llm_chain and have it return the answer with page
    monkeypatch.setattr(
        rag_chain.llm_chain,
        "predict",
        lambda **kwargs: "The Canopy algorithm is a clustering method (page 2).",
    )

    answer, sources = rag_chain.answer_with_context(
        question="What is the Canopy algorithm?",
        language="en",
        style="neutral",
    )

    assert "(page" in answer.lower()
    assert sources[0]["page"] == 2


def test_answer_refused_if_not_in_context(monkeypatch, rag_chain):
    """
    当 retriever 返回了文档，但 LLM 返回的答案不在 context 中时，
    系统必须拒答。
    """

    # mock retriever: returns an "irrelevant document"

    fake_doc = Document(
        page_content="This document talks about cats and dogs.",
        metadata={"page": 1, "source": "animals.pdf"}
    )

    monkeypatch.setattr(
        rag_chain.retriever,
        "get_relevant_documents",
        lambda _question: [fake_doc]
    )

    # mock llm_chain: Returns an "answer that is obviously not in context"
    monkeypatch.setattr(
        rag_chain.llm_chain,
        "predict",
        lambda **kwargs: "The Canopy algorithm is used for clustering large datasets."
    )

    # Call RAG
    answer, sources = rag_chain.answer_with_context(
        question="What is the Canopy algorithm?",
        language="en",
        style="neutral"
    )

    #  Assertion: Must refuse to answer
    assert "cannot find the answer" in answer.lower()
    assert sources == []
