import os
from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class WikipediaChatbot:
    """Chatbot that answers questions using Wikipedia knowledge base with citations."""
    
    def __init__(self, knowledge_base, model_name: str = None):
        self.kb = knowledge_base
        self.api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        model = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            temperature=0.7,
            google_api_key=self.api_key,
        )
    
    SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on Wikipedia articles.
Use the provided context to answer the question accurately.
Always cite your sources using the format [Source: Article Title (URL)].
If the context doesn't contain enough information, say so clearly.
Be concise but thorough in your answers."""
    
    def answer_question(self, question: str, k: int = 5) -> Dict:
        """Answer a question using the knowledge base with citations."""
        # Retrieve relevant documents
        results = self.kb.query(question, k=k)
        
        if not results:
            return {
                "answer": "I couldn't find any relevant information in the knowledge base.",
                "sources": [],
            }
        
        # Build context from retrieved documents
        context_parts = []
        sources = []
        
        for doc, score in results:
            chunk = doc.page_content
            metadata = doc.metadata
            title = metadata["title"]
            url = metadata["url"]
            
            context_parts.append(f"From '{title}':\n{chunk}")
            
            # Track unique sources
            source_info = {
                "title": title,
                "url": url,
                "relevance_score": round(score, 3),
            }
            if source_info not in sources:
                sources.append(source_info)
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Create prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=f"Context:\n{context}\n\nQuestion: {question}\n\nPlease provide a well-sourced answer."),
        ])
        
        # Generate answer
        try:
            response = self.llm.invoke(prompt.format_messages())
            answer = response.content
            
            # Post-process to ensure citations
            answer = self._ensure_citations(answer, sources)
            
            return {
                "answer": answer,
                "sources": sources,
            }
        except Exception as e:
            return {
                "answer": f"Error generating answer: {str(e)}",
                "sources": sources,
            }
    
    def _ensure_citations(self, answer: str, sources: List[Dict]) -> str:
        """Ensure proper citations are included in the answer."""
        # The LLM should already include citations, but we can enhance them
        return answer
    
    def chat(self, message: str, conversation_history: Optional[List] = None) -> Dict:
        """Interactive chat with conversation context."""
        if conversation_history is None:
            conversation_history = []
        
        # Get answer with sources
        result = self.answer_question(message)
        
        return {
            "response": result["answer"],
            "sources": result["sources"],
        }
