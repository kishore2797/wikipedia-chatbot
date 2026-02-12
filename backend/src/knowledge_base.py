import os
from typing import List, Dict, Tuple, Optional
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
import chromadb
from chromadb.config import Settings


class KnowledgeBase:
    """Build and query a searchable knowledge base from Wikipedia articles."""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        self.vectorstore = None
        self.collection_name = "wikipedia_articles"
    
    def add_articles(self, articles: List[Dict], chunk_size: int = 1000, overlap: int = 200):
        """Add Wikipedia articles to the knowledge base."""
        documents = []
        
        for article in articles:
            # Split content into chunks
            content = article["content"]
            chunks = self._chunk_content(content, chunk_size, overlap)
            
            for i, chunk in enumerate(chunks):
                doc = Document(
                    page_content=chunk,
                    metadata={
                        "title": article["title"],
                        "url": article["url"],
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                    }
                )
                documents.append(doc)
        
        # Create or update vectorstore
        if self.vectorstore is None:
            self.vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                persist_directory=self.persist_directory,
                collection_name=self.collection_name,
            )
        else:
            self.vectorstore.add_documents(documents)
        
        print(f"Added {len(documents)} document chunks to knowledge base")
    
    def _chunk_content(self, content: str, chunk_size: int, overlap: int) -> List[str]:
        """Split content into overlapping chunks."""
        import re
        
        chunks = []
        start = 0
        
        while start < len(content):
            end = min(start + chunk_size, len(content))
            chunk = content[start:end]
            
            # Try to end at a sentence boundary if not at the end
            if end < len(content):
                # Look for the last sentence ending in this chunk
                sentence_end = re.search(r'[.!?]\s+', chunk[::-1])
                if sentence_end:
                    end = start + len(chunk) - sentence_end.start() - 2
                    chunk = content[start:end]
            
            if chunk.strip():
                chunks.append(chunk.strip())
            
            start = end - overlap if end < len(content) else end
        
        return chunks
    
    def query(self, question: str, k: int = 5) -> List[Tuple[Document, float]]:
        """Query the knowledge base for relevant documents."""
        if self.vectorstore is None:
            # Try to load existing vectorstore
            try:
                self.vectorstore = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings,
                    collection_name=self.collection_name,
                )
            except Exception as e:
                print(f"Error loading vectorstore: {e}")
                return []
        
        results = self.vectorstore.similarity_search_with_relevance_scores(
            question, k=k
        )
        return results
    
    def clear(self):
        """Clear the knowledge base."""
        try:
            self.client.delete_collection(self.collection_name)
            self.vectorstore = None
            print("Knowledge base cleared")
        except Exception as e:
            print(f"Error clearing knowledge base: {e}")
    
    def get_stats(self) -> Dict:
        """Get statistics about the knowledge base."""
        try:
            collection = self.client.get_collection(self.collection_name)
            count = collection.count()
            return {
                "document_count": count,
                "persist_directory": self.persist_directory,
            }
        except Exception as e:
            return {"error": str(e)}
