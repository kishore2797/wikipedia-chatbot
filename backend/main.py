#!/usr/bin/env python3
"""
Wikipedia Chatbot - Main entry point
Fetch Wikipedia articles, build a searchable knowledge base, answer questions with citations.
"""

import argparse
import sys
from src.wiki_fetcher import WikipediaFetcher
from src.knowledge_base import KnowledgeBase
from src.chatbot import WikipediaChatbot


def build_knowledge_base(topic: str, max_articles: int = 5):
    """Build knowledge base from Wikipedia articles."""
    print(f"\n🔍 Searching Wikipedia for: '{topic}'")
    
    # Fetch articles
    fetcher = WikipediaFetcher()
    articles = fetcher.fetch_articles_by_topic(topic, max_articles=max_articles)
    
    if not articles:
        print("❌ No articles found!")
        return None
    
    print(f"✅ Fetched {len(articles)} articles:")
    for article in articles:
        print(f"   - {article['title']}")
    
    # Build knowledge base
    print("\n📚 Building knowledge base...")
    kb = KnowledgeBase()
    kb.clear()  # Clear existing data
    kb.add_articles(articles)
    
    stats = kb.get_stats()
    print(f"✅ Knowledge base ready! Documents: {stats.get('document_count', 0)}")
    
    return kb


def interactive_chat(kb):
    """Start interactive chat session."""
    print("\n🤖 Wikipedia Chatbot Ready!")
    print("Type your questions or 'quit' to exit\n")
    
    try:
        chatbot = WikipediaChatbot(kb)
    except ValueError as e:
        print(f"❌ {e}")
        print("Please set OPENAI_API_KEY in your .env file")
        return
    
    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n👋 Goodbye!")
            break
        
        if question.lower() in ['quit', 'exit', 'q']:
            print("👋 Goodbye!")
            break
        
        if not question:
            continue
        
        print("\n🤖 Thinking...")
        result = chatbot.answer_question(question)
        
        print(f"\nAnswer: {result['answer']}\n")
        
        if result['sources']:
            print("📚 Sources:")
            for source in result['sources']:
                print(f"   - {source['title']} (score: {source['relevance_score']})")
                print(f"     {source['url']}")
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Wikipedia Chatbot - Ask questions with source citations"
    )
    parser.add_argument(
        "--topic",
        type=str,
        help="Topic to build knowledge base from",
        default="Artificial Intelligence"
    )
    parser.add_argument(
        "--max-articles",
        type=int,
        help="Maximum number of articles to fetch",
        default=5
    )
    parser.add_argument(
        "--question",
        type=str,
        help="Single question to ask (non-interactive mode)"
    )
    
    args = parser.parse_args()
    
    # Build knowledge base
    kb = build_knowledge_base(args.topic, args.max_articles)
    if not kb:
        sys.exit(1)
    
    # Single question mode
    if args.question:
        try:
            chatbot = WikipediaChatbot(kb)
            result = chatbot.answer_question(args.question)
            
            print(f"\nQ: {args.question}")
            print(f"\nA: {result['answer']}\n")
            
            if result['sources']:
                print("Sources:")
                for source in result['sources']:
                    print(f"  - {source['title']}: {source['url']}")
        except ValueError as e:
            print(f"❌ {e}")
            sys.exit(1)
    else:
        # Interactive mode
        interactive_chat(kb)


if __name__ == "__main__":
    main()
