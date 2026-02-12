# Wikipedia Chatbot

A full-stack app that fetches Wikipedia articles on any topic, builds a searchable vector knowledge base, and answers factual questions with source citations.

## Architecture

```
wikipedia-chatbot/
├── backend/                # Python FastAPI server
│   ├── web_app.py          # API server (port 8000)
│   ├── main.py             # CLI mode
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       ├── wiki_fetcher.py     # Wikipedia article fetching
│       ├── knowledge_base.py   # ChromaDB vector store
│       └── chatbot.py          # OpenAI Q&A with citations
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/client.js       # API client
│   │   └── components/
│   │       ├── TopicBuilder.jsx
│   │       ├── ChatInterface.jsx
│   │       └── Sidebar.jsx
│   └── package.json
└── README.md
```

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons
- **Backend**: FastAPI, LangChain, OpenAI GPT
- **Database**: ChromaDB (vector store) with sentence-transformers embeddings
- **Data Source**: Wikipedia API

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add your OPENAI_API_KEY
python web_app.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## How It Works

1. **Search** — Enter a topic, the app searches Wikipedia for related articles
2. **Index** — Articles are chunked, embedded with `all-MiniLM-L6-v2`, and stored in ChromaDB
3. **Ask** — Type a question; relevant chunks are retrieved via semantic search
4. **Answer** — OpenAI GPT synthesizes an answer with `[Source: Article (URL)]` citations
5. **Cite** — Every response shows clickable Wikipedia source links with relevance scores

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Knowledge base status |
| GET | `/api/search?q=...` | Search Wikipedia titles |
| POST | `/api/build` | Build KB from topic |
| POST | `/api/ask` | Ask a question |
| GET | `/api/history` | Conversation history |
| DELETE | `/api/history` | Clear history |
