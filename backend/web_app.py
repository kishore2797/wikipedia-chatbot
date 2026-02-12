from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import asyncio
import uvicorn
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src.wiki_fetcher import WikipediaFetcher
from src.knowledge_base import KnowledgeBase
from src.chatbot import WikipediaChatbot

app = FastAPI(title="Wikipedia Chatbot API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------
knowledge_base: Optional[KnowledgeBase] = None
chatbot: Optional[WikipediaChatbot] = None
current_topic: Optional[str] = None
indexed_articles: List[dict] = []
conversation_history: List[dict] = []

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class BuildRequest(BaseModel):
    topic: str
    max_articles: int = 5

class QuestionRequest(BaseModel):
    question: str

class ArticleInfo(BaseModel):
    title: str
    url: str
    summary: str = ""

class BuildResponse(BaseModel):
    success: bool
    message: str
    articles: List[ArticleInfo]
    document_count: int

class SourceInfo(BaseModel):
    title: str
    url: str
    relevance_score: float

class AnswerResponse(BaseModel):
    answer: str
    sources: List[SourceInfo]

class ConversationMessage(BaseModel):
    role: str          # "user" | "assistant"
    content: str
    sources: List[SourceInfo] = []
    timestamp: str

class StatusResponse(BaseModel):
    kb_ready: bool
    topic: Optional[str]
    article_count: int
    document_count: int
    articles: List[ArticleInfo]
    conversation_length: int

class SearchResult(BaseModel):
    titles: List[str]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    """Return current state of the knowledge base."""
    doc_count = 0
    if knowledge_base:
        stats = knowledge_base.get_stats()
        doc_count = stats.get("document_count", 0)

    return StatusResponse(
        kb_ready=chatbot is not None,
        topic=current_topic,
        article_count=len(indexed_articles),
        document_count=doc_count,
        articles=[ArticleInfo(**a) for a in indexed_articles],
        conversation_length=len(conversation_history),
    )


@app.get("/api/search", response_model=SearchResult)
async def search_wikipedia(q: str, limit: int = 10):
    """Search Wikipedia for article titles (autocomplete)."""
    fetcher = WikipediaFetcher()
    titles = await asyncio.to_thread(fetcher.search_articles, q, limit)
    return SearchResult(titles=titles)


@app.post("/api/build", response_model=BuildResponse)
async def build_kb(request: BuildRequest):
    """Fetch Wikipedia articles and build the vector knowledge base."""
    global knowledge_base, chatbot, current_topic, indexed_articles, conversation_history

    try:
        fetcher = WikipediaFetcher()
        articles_data = await asyncio.to_thread(
            fetcher.fetch_articles_by_topic, request.topic, request.max_articles
        )

        if not articles_data:
            return BuildResponse(
                success=False,
                message="No articles found for this topic",
                articles=[],
                document_count=0,
            )

        knowledge_base = KnowledgeBase()
        knowledge_base.clear()
        await asyncio.to_thread(knowledge_base.add_articles, articles_data)

        try:
            chatbot = await asyncio.to_thread(WikipediaChatbot, knowledge_base)
        except ValueError:
            return BuildResponse(
                success=False,
                message="GOOGLE_API_KEY not configured. Add it to backend/.env",
                articles=[],
                document_count=0,
            )

        current_topic = request.topic
        indexed_articles = [
            {"title": a["title"], "url": a["url"], "summary": a.get("summary", "")[:200]}
            for a in articles_data
        ]
        conversation_history = []

        stats = knowledge_base.get_stats()
        articles_out = [ArticleInfo(**a) for a in indexed_articles]

        return BuildResponse(
            success=True,
            message=f"Indexed {len(articles_data)} articles on \"{request.topic}\"",
            articles=articles_out,
            document_count=stats.get("document_count", 0),
        )

    except Exception as e:
        return BuildResponse(
            success=False,
            message=f"Error: {str(e)}",
            articles=[],
            document_count=0,
        )


@app.post("/api/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """Ask a question against the knowledge base."""
    global conversation_history

    if not chatbot:
        raise HTTPException(status_code=400, detail="Knowledge base not built yet. Index a topic first.")

    try:
        result = await asyncio.to_thread(chatbot.answer_question, request.question)

        sources = [
            SourceInfo(title=s["title"], url=s["url"], relevance_score=s["relevance_score"])
            for s in result["sources"]
        ]

        now = datetime.utcnow().isoformat()
        conversation_history.append(
            {"role": "user", "content": request.question, "sources": [], "timestamp": now}
        )
        conversation_history.append(
            {"role": "assistant", "content": result["answer"],
             "sources": [s.dict() for s in sources], "timestamp": now}
        )

        return AnswerResponse(answer=result["answer"], sources=sources)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history", response_model=List[ConversationMessage])
async def get_history():
    """Return full conversation history."""
    return [ConversationMessage(**m) for m in conversation_history]


@app.delete("/api/history")
async def clear_history():
    """Clear conversation history."""
    global conversation_history
    conversation_history = []
    return {"message": "Conversation cleared"}


if __name__ == "__main__":
    uvicorn.run("web_app:app", host="0.0.0.0", port=8000, reload=True)
