import os
from typing import Any

from langchain_core.output_parsers import StrOutputParser
from langchain_deepseek import ChatDeepSeek

from .prompts import qa_prompt, summary_map_prompt, summary_reduce_prompt


def build_llm(model: str = "deepseek-chat", temperature: float = 0.3, **kwargs: Any):
    api_key = kwargs.pop("api_key", None) or os.getenv("DEEPSEEK_API_KEY")
    if api_key is None:
        # In test environments we stub the model, so allow missing key by providing a dummy.
        api_key = "DUMMY_FOR_TESTS"
    return ChatDeepSeek(model=model, temperature=temperature, api_key=api_key, **kwargs)


def build_chain(prompt):
    """LCEL-style chain -> returns string output."""
    return prompt | llm | StrOutputParser()


llm = build_llm()
qa_chain = build_chain(qa_prompt)
summary_map_chain = build_chain(summary_map_prompt)
summary_reduce_chain = build_chain(summary_reduce_prompt)
