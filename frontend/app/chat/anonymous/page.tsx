'use client';

import { useEffect, useRef, useState } from 'react';
import ResponsiveHeader from '@/components/ResponsiveHeader';

interface Message {
  id: number;
  message_type: 'user' | 'bot';
  content: string;
  created_at: string;
}

export default function AnonymousChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('chat_theme') || 'calm' : 'calm'));
  const wsRef = useRef<WebSocket | null>(null);
  const [wsEnabled, setWsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore or create session id
    const existing = typeof window !== 'undefined' ? sessionStorage.getItem('anon_chat_session_id') : null;
    if (existing) {
      setSessionId(existing);
      return;
    }
    const start = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/chatbot/anon/start/', { method: 'POST' });
        const data = await res.json();
        setSessionId(data.session_id);
        if (typeof window !== 'undefined') sessionStorage.setItem('anon_chat_session_id', data.session_id);
      } catch {
        const sid = 'anon-' + Date.now();
        setSessionId(sid);
        if (typeof window !== 'undefined') sessionStorage.setItem('anon_chat_session_id', sid);
      }
    };
    start();
  }, []);

  useEffect(() => {
    if (!sessionId || !wsEnabled) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${protocol}://localhost:8000/ws/chatbot/${sessionId}/`);
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ message: 'joined' }));
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.message) {
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + Math.floor(Math.random() * 1000), message_type: 'bot', content: data.message, created_at: new Date().toISOString() },
            ]);
          }
        } catch {}
      };
      ws.onclose = () => { wsRef.current = null; };
    } catch {}
  }, [sessionId, wsEnabled]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    const userMessage: Message = { id: Date.now(), message_type: 'user', content: input, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    const prevForContext = messages.slice(-15).map((m) => ({ message_type: m.message_type, content: m.content }));
    const text = input;
    setInput('');
    setLoading(true);
    try {
      if (wsEnabled && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: text }));
      }
      const res = await fetch('http://localhost:8000/api/chatbot/anon/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, previous_messages: prevForContext })
      });
      const data = await res.json();
      const botMessage: Message = { id: Date.now() + 1, message_type: 'bot', content: data.bot_response || '...', created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const botMessage: Message = { id: Date.now() + 1, message_type: 'bot', content: 'Demo response (offline).', created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white min-h-screen ${theme === 'calm' ? '' : theme === 'bubbles' ? 'bubble-bg' : ''}`}>
      <ResponsiveHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Anonymous Chat</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm"><input type="checkbox" checked={wsEnabled} onChange={(e) => setWsEnabled(e.target.checked)} className="mr-1" /> Real-time</label>
            <select value={theme} onChange={(e) => { setTheme(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('chat_theme', e.target.value); }} className="border rounded px-2 py-1 text-sm">
              <option value="calm">Calm</option>
              <option value="bubbles">Bubbles</option>
              <option value="fade">Fade</option>
            </select>
          </div>
        </header>

        <div className="bg-gray-100 rounded-lg shadow-lg" style={{ minHeight: '60vh' }}>
          <div className="p-4 h-[50vh] overflow-y-auto flex flex-col gap-3">
            <div ref={messagesEndRef} />
            {messages.map((m) => (
              <div key={m.id} className="flex" style={{ justifyContent: m.message_type === 'user' ? 'flex-end' : 'flex-start', animation: 'fade-in 0.3s ease-out' }}>
                <div className={`${m.message_type === 'user' ? 'bg-sky-500 text-white' : 'bg-white text-gray-800'} rounded-xl px-3 py-2 max-w-[70%]`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-500">Typing…</div>}
          </div>
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} placeholder="Write a message…" className="flex-1 border rounded-full px-4 py-2" />
              <button onClick={sendMessage} className="bg-orange-500 text-white px-4 py-2 rounded-full disabled:opacity-50" disabled={!input.trim() || !sessionId || loading}>Send</button>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .bubble-bg::before { content: ''; position: fixed; inset: 0; background: radial-gradient(circle at 10% 20%, rgba(0,168,247,0.08), transparent 40%), radial-gradient(circle at 80% 10%, rgba(147,51,234,0.08), transparent 35%), radial-gradient(circle at 30% 80%, rgba(8,145,178,0.08), transparent 35%); pointer-events: none; animation: subtle-move 12s ease-in-out infinite alternate; }
        @keyframes subtle-move { 0% { transform: translateY(0px); filter: hue-rotate(0deg); } 100% { transform: translateY(10px); filter: hue-rotate(10deg); } }
      `}</style>
    </div>
  );
}


