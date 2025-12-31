from langchain_core.prompts import PromptTemplate

qa_prompt = PromptTemplate.from_template(
    """
You are a helpful assistant. Answer the question using ONLY the provided context.
If the answer is not in the context, say: "I cannot find the answer in the provided documents."

Respond in the requested language: {language}
Use the requested tone/style: {style}

Always include at least one inline page citation. Use "(page X)" in most cases; use "(第X页)" for Chinese, "(side X)" for Danish, and "(seite X)" for German. Pull page numbers from the provided context.
Keep the answer concise and cite page numbers inline, e.g., (page 3).

Question: {question}

Context:
{context}
"""
)

summary_map_prompt = PromptTemplate.from_template(
    """
You are creating a brief summary of a PDF chunk.
Respond in the requested language: {language}. Use the requested tone/style: {style}.

Chunk:
{chunk}

Write a concise 1-2 sentence summary.
"""
)

summary_reduce_prompt = PromptTemplate.from_template(
    """
You are creating an overall summary from chunk summaries.
Respond in the requested language: {language}. Use the requested tone/style: {style}.

Chunk summaries:
{summaries}

Write a concise overall summary (3-5 sentences) highlighting the main idea and key points.
"""
)
