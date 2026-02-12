const BASE = '/api';

export async function getStatus() {
  const res = await fetch(`${BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function searchWikipedia(query, limit = 10) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function buildKnowledgeBase(topic, maxArticles = 5) {
  const res = await fetch(`${BASE}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, max_articles: maxArticles }),
  });
  if (!res.ok) throw new Error('Build failed');
  return res.json();
}

export async function askQuestion(question) {
  const res = await fetch(`${BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${BASE}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}
