import { Database, FileText, Hash, Clock } from 'lucide-react';

export default function Sidebar({ status }) {
  if (!status) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* KB Status */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
            <p className="text-xs text-gray-500">Current index status</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-600">Status</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                status.kb_ready
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {status.kb_ready ? 'Ready' : 'Not Built'}
            </span>
          </div>

          {status.topic && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">Topic</span>
              <span className="text-sm font-medium text-gray-900 truncate ml-3 max-w-[140px]">
                {status.topic}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Articles</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{status.article_count}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Chunks</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{status.document_count}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Messages</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{status.conversation_length}</span>
          </div>
        </div>
      </div>

      {/* Indexed Articles */}
      {status.articles && status.articles.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Indexed Articles
          </p>
          <div className="space-y-2">
            {status.articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 rounded-lg text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors truncate"
              >
                {article.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Tech Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {['ChromaDB', 'LangChain', 'OpenAI', 'Wikipedia', 'FastAPI', 'React'].map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
