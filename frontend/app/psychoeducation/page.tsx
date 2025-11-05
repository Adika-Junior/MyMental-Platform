'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';

interface PsychoeducationItem {
  id: number;
  title: string;
  category: string;
  content: string;
  resources: string[];
  created_at: string;
}

export default function PsychoeducationPage() {
  const [items, setItems] = useState<PsychoeducationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (q) params.append('q', q);
    const res = await fetchWithAuth(`http://localhost:8000/api/chatbot/psychoeducation/${params.toString() ? `?${params.toString()}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute>
      <ResponsiveHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Psychoeducation</h1>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="border rounded px-3 py-2 w-full sm:w-1/2"
            placeholder="Search topics (e.g., breathing, stress, anxiety)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 w-full sm:w-1/3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            <option value="breathing">Breathing</option>
            <option value="mindfulness">Mindfulness</option>
            <option value="coping">Coping</option>
            <option value="sleep">Sleep</option>
            <option value="stress">Stress</option>
          </select>
          <button
            className="bg-blue-600 text-white rounded px-4 py-2"
            onClick={fetchItems}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Filter'}
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-gray-500">No content found.</p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {items.map((it) => (
            <article key={it.id} className="border rounded p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{it.title}</h2>
                <span className="text-xs uppercase tracking-wide text-gray-500">{it.category}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line mb-3">
                {it.content.length > 240 ? it.content.slice(0, 240) + '…' : it.content}
              </p>
              {it.resources?.length ? (
                <ul className="text-sm list-disc ml-5 text-blue-700">
                  {it.resources.map((r, i) => (
                    <li key={i}>
                      <a className="underline" href={typeof r === 'string' ? r : '#'} target="_blank" rel="noreferrer">
                        {typeof r === 'string' ? r : 'Resource'}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}


