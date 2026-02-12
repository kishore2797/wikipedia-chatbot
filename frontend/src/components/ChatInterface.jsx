import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ExternalLink, Bot, User, Trash2 } from 'lucide-react';
import { askQuestion, clearHistory } from '../api/client';

export default function ChatInterface({ isReady, topic }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages when topic changes
  useEffect(() => {
    if (topic) {
      setMessages([
        {
          role: 'assistant',
          content: `Knowledge base ready! Ask me anything about "${topic}".`,
          sources: [],
        },
      ]);
    }
  }, [topic]);

  async function handleSend(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading || !isReady) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q, sources: [] }]);
    setLoading(true);

    try {
      const data = await askQuestion(q);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      await clearHistory();
      setMessages([]);
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <p className="text-xs text-gray-500">
              {isReady ? `Asking about "${topic}"` : 'Build a knowledge base first'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!isReady && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Index a Wikipedia topic to start chatting</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                  : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-1.5">
                  <p className="text-xs font-medium opacity-70">Sources:</p>
                  {msg.sources.map((src, j) => (
                    <a
                      key={j}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{src.title}</span>
                      <span className="text-gray-400 shrink-0">({(src.relevance_score * 100).toFixed(0)}%)</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isReady ? 'Ask a question...' : 'Build knowledge base first...'}
            disabled={!isReady || loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50 disabled:bg-gray-50 transition-all"
          />
          <button
            type="submit"
            disabled={!isReady || loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
