from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import LLMChain
from langchain_deepseek import ChatDeepSeek
import os
import logging
from dotenv import load_dotenv

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# 初始化嵌入模型
embedding = HuggingFaceEmbeddings(
    model_name="nomic-ai/nomic-embed-text-v1",
    model_kwargs={"trust_remote_code": True}
)

# 初始化 Chroma 向量库（假设已经预先插入模板内容）
try:
    persist_directory = "./chroma_db"
    vectorstore = Chroma(
        persist_directory=persist_directory, embedding_function=embedding
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    logger.info("成功加载 Chroma 向量库")
except Exception as e:
    logger.error(f" 加载 Chroma 向量库失败: {e}")
    raise

# PromptTemplate
prompt = PromptTemplate.from_template(
    """
You are a professional writing assistant.

Your task is to revise the **previous version** of a document based on the user’s intent.
You **must retain** the structure and content of the previous version, and make **minimal, localized edits** only where necessary to reflect the intent, style, and language preferences.

Do **not** rewrite the entire document.
Do **not** change parts unrelated to the new intent.
Do **not** invent any new content.
Do **not** format using Markdown symbols like ##, **, -, or *.

If no changes are needed, return the original text and note "No changes made."

If the reference template does not match the user's intent at all, and no relevant revisions can be made,
return the following response exactly, and DO NOT include any document body or change summary:

"Did not find any template matched, please try the wild mode."

Use only plain text for formatting. Separate sections using blank lines if needed.

---

User Intent:
{intent}

Preferred Style: {style}
Language: {language}

Reference Template:
{context}

Previous Version:
{previous}


At the end of your response, provide a summary of changes made in this format:

Changes:
- [brief description of change 1]
- [brief description of change 2]
(If no changes, write "No changes made.")

Please confirm there were no other changes made beyond what is listed above.

"""
)

# 初始化 DeepSeek 模型
try:
    llm = ChatDeepSeek(model="deepseek-chat", temperature=0.5, api_key=DEEPSEEK_API_KEY)
    logger.info("DeepSeek 模型初始化成功")
except Exception as e:
    logger.error(f" DeepSeek 模型初始化失败: {e}")
    raise

# 构造 LLMChain
llm_chain = LLMChain(llm=llm, prompt=prompt)

def is_irrelevant(docs, intent):
    # 判断是否所有doc都不包含 intent 的关键词
    intent_keywords = intent.lower().split()
    return all(
        not any(keyword in doc.page_content.lower() for keyword in intent_keywords)
        for doc in docs
    )

# 主函数
def generate_with_template(
    intent: str, style: str, language: str, history: list[dict] = None
) -> str:
    try:
        if not intent.strip():
            return "please provide a valid intent"

        logger.info(f"searching intent: {intent}")
        docs = retriever.get_relevant_documents(intent)

        if not docs or is_irrelevant(docs, intent):  # 新加判断函数
            logger.warning("did not find any template matched, please try the wild mode")
            return "did not find any template matched, please try the wild mode"

        logger.info(f"found {len(docs)} templates")
        context = "\n\n".join([doc.page_content for doc in docs])

        # 提取最近一条 assistant
        previous = ""
        if history:
            for msg in reversed(history):
                if msg.role == "assistant":
                    previous = msg.content
                    break

        result = llm_chain.run(
            {
                "intent": intent,
                "style": style or "formal",
                "language": language or "English",
                "context": context,
                "previous": previous,
            }
        )

        logger.info("generate content successfully")
        return result.strip()

    except Exception as e:
        logger.error(f"failed to generate content: {e}", exc_info=True)
        return "failed to generate content :" + str(e)
