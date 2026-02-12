import { useState } from 'react';
import { Search, BookOpen, Loader2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { buildKnowledgeBase } from '../api/client';

export default function TopicBuilder({ onBuildComplete }) {
  const [topic, setTopic] = useState('');
  const [maxArticles, setMaxArticles] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const suggestions = [
    'Artificial Intelligence',
    'Climate Change',
    'Space Exploration',
    'Quantum Computing',
    'Ancient Egypt',
    'Machine Learning',
  ];

  async function handleBuild(e) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await buildKnowledgeBase(topic.trim(), maxArticles);
      if (data.success) {
        setResult(data);
        onBuildComplete(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Build Knowledge Base</h2>
          <p className="text-sm text-gray-500">Search a topic to fetch Wikipedia articles</p>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTopic(s)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-200 hover:border-emerald-200"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleBuild} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Articles:</label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxArticles}
              onChange={(e) => setMaxArticles(Number(e.target.value))}
              className="w-16 py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building...
              </>
            ) : (
              'Build'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">{result.message}</p>
              <p className="text-xs text-emerald-600 mt-1">{result.document_count} document chunks indexed</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Indexed Articles</p>
            {result.articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">{article.title}</p>
                  {article.summary && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{article.summary}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
