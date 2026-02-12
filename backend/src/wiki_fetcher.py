import wikipedia
from typing import List, Dict, Optional
import re


class WikipediaFetcher:
    """Fetch and process Wikipedia articles."""
    
    def __init__(self, language: str = "en"):
        wikipedia.set_lang(language)
        self.language = language
    
    def search_articles(self, query: str, results: int = 10) -> List[str]:
        """Search for Wikipedia articles matching the query."""
        try:
            return wikipedia.search(query, results=results)
        except Exception as e:
            print(f"Error searching Wikipedia: {e}")
            return []
    
    def fetch_article(self, title: str) -> Optional[Dict]:
        """Fetch a single Wikipedia article by title."""
        try:
            page = wikipedia.page(title, auto_suggest=False)
            return {
                "title": page.title,
                "content": page.content,
                "url": page.url,
                "summary": page.summary,
            }
        except wikipedia.DisambiguationError as e:
            print(f"Disambiguation error for '{title}': {e.options}")
            return None
        except wikipedia.PageError:
            print(f"Page '{title}' not found")
            return None
        except Exception as e:
            print(f"Error fetching '{title}': {e}")
            return None
    
    def fetch_articles_by_topic(self, topic: str, max_articles: int = 5) -> List[Dict]:
        """Fetch multiple articles related to a topic."""
        titles = self.search_articles(topic, results=max_articles)
        articles = []
        
        for title in titles[:max_articles]:
            article = self.fetch_article(title)
            if article:
                articles.append(article)
        
        return articles
    
    def chunk_content(self, content: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split content into overlapping chunks for better retrieval."""
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + chunk_size
            chunk = content[start:end]
            
            # Try to end at a sentence boundary
            if end < len(content):
                # Look for sentence endings
                match = re.search(r'[.!?]\s+', chunk[::-1])
                if match:
                    end = start + len(chunk) - match.start() - 2
                    chunk = content[start:end]
            
            chunks.append(chunk.strip())
            start = end - overlap
        
        return chunks
