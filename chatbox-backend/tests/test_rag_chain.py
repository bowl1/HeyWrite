import importlib
import sys
from typing import List
from unittest.mock import MagicMock

import pytest
from langchain_core.documents import Document

# RAG behavior tests


@pytest.fixture()
def rag_chain(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "DUMMY_FOR_TESTS")

    stub_qa_chain = MagicMock()
    stub_qa_chain.invoke.return_value = "stub answer"

    stub_retriever = MagicMock()
    stub_retriever.invoke.return_value = []

    # Ensure fresh imports
    for mod in ["langchain_runner.qa", "langchain_runner.vectorstore"]:
        sys.modules.pop(mod, None)

    qa_module = importlib.import_module("langchain_runner.qa")
    monkeypatch.setattr(qa_module, "qa_chain", stub_qa_chain)
    monkeypatch.setattr(qa_module, "retriever", stub_retriever)

    return qa_module


def test_answer_contains_page_citation(monkeypatch, rag_chain):
    # mock retriever returns a fake doc
    fake_doc = Document(
        page_content="Canopy clustering is a fast clustering algorithm.",
        metadata={"page": 2, "source": "test.pdf"},
    )
    rag_chain.retriever.invoke.return_value = [fake_doc]

    # Mock qa_chain and have it return the answer with page
    rag_chain.qa_chain.invoke.return_value = (
        "The Canopy algorithm is a clustering method (page 2)."
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

    rag_chain.retriever.invoke.return_value = [fake_doc]

    # mock qa_chain: Returns an "answer that is obviously not in context"
    rag_chain.qa_chain.invoke.return_value = (
        "The Canopy algorithm is used for clustering large datasets."
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
