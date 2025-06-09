# ✨ HeyWrite - AI Smart Writing Assistant

HeyWrite is a smart AI-powered writing assistant that helps you draft professional content based on your intent, tone, and language — all with just one sentence.

Now enhanced with Retrieval-Augmented Generation (RAG), custom templates, multi-turn memory, and more — HeyWrite makes writing faster, smarter, and more personalized.

---

## 🔗 Visit

- **Web App**: [https://hey-write.vercel.app](https://hey-write.vercel.app)


---

## 🚀 Features

-  Generate instant writing drafts from your one-sentence intent
- Choose between two generation modes:
    - Generate with templates: AI automatically matches your input to a relevant predefined template using vector search
    - Generate something wild: Freely generate content without relying on templates
- Your intent is automatically matched to the most relevant template using vector search. If no suitable template is found, the app suggests using wild mode for freeform generation.

- Maintains **multi-turn conversation history**
- Revisit previous results and modify based on that
- Clear chat history and start a new conversation
- Summarize and highlight the changes made between the previous version and the newly generated content
- Control tone and style: Formal, Casual, Polite Push, Concise & Direct, Humorous, or Creative
- Supports **English**, **Chinese**, and **Danish**
- One-click copy of generated content

---

## ⚙️ Tech Stack

| Category        | Technology                            |
|----------------|----------------------------------------|
| **Frontend**    | React + TypeScript (deployed via Vercel)|
| **Backend**     | FastAPI (Dockerized, deployed on AWS EC2) |
| **AI Model**    | DeepSeek Chat API                     |
| **Embedding**   | HuggingFace (`intfloat/e5-small-v2`)  |
| **Vector Store**| ChromaDB                              |
| **Frameworks**  | LangChain for RAG and template routing |
| **Deployment**  | Docker + Nginx + HTTPS (Let’s Encrypt), GitHub Actions, AWS EC2|
---

## 📂 Architecture Overview

1. **Intent Input** →  
2. **Vector Search (Chroma + LangChain Retriever)** →  
3. **LLM Prompting with Context** →  
4. **Document Draft Output**  
5. **Editable + Copyable + Chat History Aware**

---

## 📸 Screenshots

### Web Demo

![Demo GIF](./images/demo.gif)

---


### Web UI

#### 📄 User Case: Project Weekly Report  
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="images/web1.png" alt="Web UI 1" width="300">    
  <img src="images/web2.png" alt="Web UI 2" width="300">    
  <img src="images/web3.png" alt="Web UI 3" width="300">    
</div>

#### ⚠️ No Matched Template (using "Generate with templates" button)  
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="images/web4.png" alt="Web UI 4" width="300">  
</div>

#### 📑 User Case: Contract Risk Review  
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="images/web5.png" alt="Web UI 5" width="300">  
  <img src="images/web6.png" alt="Web UI 6" width="300">  
  <img src="images/web7.png" alt="Web UI 7" width="300">  
  <img src="images/web8.png" alt="Web UI 8" width="300">  
</div>

---

### Mobile UI

![Demo GIF](./images/demo-mobile.gif)

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="images/mobile1.png" alt="Web UI 5" width="300">  
  <img src="images/mobile2.png" alt="Web UI 6" width="300">  
  <img src="images/mobile3.png" alt="Web UI 7" width="300">  
  <img src="images/mobile4.png" alt="Web UI 8" width="300">  
</div>