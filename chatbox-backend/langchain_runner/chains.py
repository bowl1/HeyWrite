import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_deepseek import ChatDeepSeek

from .prompts import qa_prompt, summary_map_prompt, summary_reduce_prompt

# Ensure we load the repo root .env before instantiating the LLM
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")


def build_llm(model: str = "deepseek-chat", temperature: float = 0.3, **kwargs: Any):
    api_key = kwargs.pop("api_key", None) or os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY not set; cannot initialize DeepSeek client")
    return ChatDeepSeek(model=model, temperature=temperature, api_key=api_key, **kwargs)


def build_chain(prompt):
    """LCEL-style chain -> returns string output."""
    return prompt | llm | StrOutputParser()


llm = build_llm()
qa_chain = build_chain(qa_prompt)
summary_map_chain = build_chain(summary_map_prompt)
summary_reduce_chain = build_chain(summary_reduce_prompt)
