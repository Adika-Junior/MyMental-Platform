'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [token, setToken] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  const loadDevices = async () => {
    const res = await fetchWithAuth('http://localhost:8000/api/chatbot/notifications/devices/');
    if (res.ok) setDevices(await res.json());
  };

  useEffect(() => { loadDevices(); }, []);

  const register = async () => {
    if (!token.trim()) return;
    const res = await fetchWithAuth('http://localhost:8000/api/chatbot/notifications/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: 'web' })
    });
    if (res.ok) {
      setToken('');
      await loadDevices();
    }
  };

  const unregister = async (t: string) => {
    await fetchWithAuth('http://localhost:8000/api/chatbot/notifications/unregister/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t })
    });
    await loadDevices();
  };

  const sendTest = async (t?: string) => {
    setSending(true);
    try {
      await fetchWithAuth('http://localhost:8000/api/chatbot/notifications/test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t })
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <ResponsiveHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Push Notifications (FCM)</h1>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <p className="text-gray-600 text-sm">Paste a Web FCM token to register this device for notifications.</p>
          <div className="flex gap-2">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="FCM token" className="flex-1 border rounded px-3 py-2" />
            <button onClick={register} className="bg-blue-600 text-white rounded px-4 py-2">Register</button>
          </div>
          <div>
            <h2 className="font-medium mb-2">Registered devices</h2>
            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={d.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono break-all">{d.token.slice(0, 40)}…</div>
                    <div className="text-xs text-gray-500">{d.platform} • {d.active ? 'active' : 'inactive'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sendTest(d.token)} disabled={sending} className="bg-green-600 text-white rounded px-3 py-1 text-sm">Test</button>
                    <button onClick={() => unregister(d.token)} className="bg-red-600 text-white rounded px-3 py-1 text-sm">Remove</button>
                  </div>
                </li>
              ))}
              {devices.length === 0 && <li className="text-sm text-gray-500">No devices yet.</li>}
            </ul>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}


