# 🤖 Wikipedia Chatbot

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/ChromaDB-0.4+-FF6F00?style=flat-square" />
</p>

> **RAG over live Wikipedia** — Fetch articles on any topic, build a searchable knowledge base, and answer factual questions with source citations.

Part of the [Mastering RAG](https://github.com/kishore2797/mastering-rag) ecosystem → tutorial: [rag-06-wikipedia-chatbot](https://github.com/kishore2797/rag-06-wikipedia-chatbot).

---

## 🌍 Real-World Scenario

> A teacher wants a classroom assistant that students can ask about any topic. Unlike ChatGPT, it should **cite Wikipedia sources** so students can verify facts. Add "Photosynthesis," "World War II," or "Python programming" as topics; students ask questions and get answers from those articles — every claim traceable to a source URL.

---

## 🏗️ What You'll Build

A full-stack chatbot that fetches Wikipedia articles on any topic, builds a vector knowledge base, and answers questions with source citations. Works with **live, evolving data** instead of static files.

```
"Add topic: Quantum Computing" ──→ Fetch Wikipedia ──→ Chunk & embed ──→ Store
                                                                          ↓
"How do quantum gates work?" ──→ Retrieve from KB ──→ Answer + citations
```

## 🔑 Key Concepts

- **Dynamic data ingestion** — Fetch and index from live APIs (Wikipedia), not just static files
- **Knowledge base management** — Add/remove topics, track what's indexed
- **Multi-topic retrieval** — Search across multiple Wikipedia articles at once
- **Citation generation** — Every answer links back to the Wikipedia source URL

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+ · FastAPI · Wikipedia API · ChromaDB · Sentence-Transformers · OpenAI |
| Frontend | React 19 · Vite · Tailwind CSS · Lucide Icons |

## 📁 Project Structure

```
wikipedia-chatbot/
├── backend/
│   ├── web_app.py          # API server (port 8000)
│   ├── main.py             # CLI mode
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       ├── wiki_fetcher.py     # Wikipedia article fetching
│       ├── knowledge_base.py   # ChromaDB vector store
│       └── chatbot.py          # OpenAI Q&A with citations
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/client.js
│   │   └── components/
│   │       ├── TopicBuilder.jsx
│   │       ├── ChatInterface.jsx
│   │       └── Sidebar.jsx
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add your OPENAI_API_KEY
uvicorn web_app:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — add topics, build your knowledge base, and chat with citations.

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Knowledge base status |
| GET | `/api/search?q=...` | Search Wikipedia titles |
| POST | `/api/build` | Build KB from topic |
| POST | `/api/ask` | Ask a question |
| GET | `/api/history` | Conversation history |
| DELETE | `/api/history` | Clear history |

## 📖 How It Works

1. **Search** — Enter a topic; the app searches Wikipedia for related articles
2. **Index** — Articles are chunked, embedded with `all-MiniLM-L6-v2`, and stored in ChromaDB
3. **Ask** — Type a question; relevant chunks are retrieved via semantic search
4. **Answer** — OpenAI GPT synthesizes an answer with `[Source: Article (URL)]` citations
5. **Cite** — Every response shows clickable Wikipedia source links
