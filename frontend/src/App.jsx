import { useState, useEffect, useCallback } from 'react';
import { BookOpenCheck } from 'lucide-react';
import TopicBuilder from './components/TopicBuilder';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { getStatus } from './api/client';

function App() {
  const [status, setStatus] = useState(null);
  const [kbReady, setKbReady] = useState(false);
  const [topic, setTopic] = useState(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus(data);
      setKbReady(data.kb_ready);
      setTopic(data.topic);
    } catch {
      // backend not running yet
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  function handleBuildComplete(data) {
    setKbReady(true);
    setTopic(data.articles?.[0] ? undefined : null);
    // Re-derive topic from the build response message
    const match = data.message?.match(/"(.+)"/);
    setTopic(match ? match[1] : 'Unknown');
    setStatus((prev) => ({
      ...prev,
      kb_ready: true,
      topic: match ? match[1] : prev?.topic,
      article_count: data.articles.length,
      document_count: data.document_count,
      articles: data.articles,
      conversation_length: 0,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
            <BookOpenCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Wikipedia Chatbot</h1>
            <p className="text-xs text-gray-500">
              Ask factual questions, get answers with source citations
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <TopicBuilder onBuildComplete={handleBuildComplete} />
            <ChatInterface isReady={kbReady} topic={topic} />
          </div>

          {/* Right column - Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <Sidebar status={status} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
