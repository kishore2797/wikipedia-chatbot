# Wikipedia Chatbot — Backend

FastAPI server that fetches Wikipedia articles, indexes them in ChromaDB, and answers questions via OpenAI with source citations.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env   # add your OPENAI_API_KEY
```

## Run

```bash
python web_app.py      # API server on http://localhost:8000
python main.py --topic "AI"  # CLI mode
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Knowledge base status |
| GET | `/api/search?q=...` | Search Wikipedia titles |
| POST | `/api/build` | Build KB from topic |
| POST | `/api/ask` | Ask a question |
| GET | `/api/history` | Conversation history |
| DELETE | `/api/history` | Clear history |
