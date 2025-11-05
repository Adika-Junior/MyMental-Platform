'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Me = {
  id: number;
  username: string;
  email: string;
  user_type: string;
};

type Prefs = {
  push_enabled: boolean;
  alerts_enabled: boolean;
  marketing_enabled: boolean;
  quiet_hours: {
    start: string | null;
    end: string | null;
    timezone: string | null;
  };
};

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [meRes, prefsRes] = await Promise.all([
          fetch('/api/users/me', { credentials: 'include' }),
          fetch('/api/chatbot/notifications/preferences/', { credentials: 'include' }),
        ]);
        if (meRes.ok) {
          const data = await meRes.json();
          if (mounted) {
            setMe(data);
            setUsername(data.username || '');
            setEmail(data.email || '');
          }
        }
        if (prefsRes.ok) {
          const p = await prefsRes.json();
          if (mounted) setPrefs(p);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (isAuthenticated) load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'Failed to save profile');
      }
      const updated = await res.json();
      setMe(updated);
      setMessage('Profile saved');
    } catch (err: any) {
      setMessage(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function savePrefs(e: React.FormEvent) {
    e.preventDefault();
    if (!prefs) return;
    setPrefsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/chatbot/notifications/preferences/update/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      const p = await res.json();
      setPrefs(p);
      setMessage('Preferences saved');
    } catch (err: any) {
      setMessage(err.message || 'Failed to save preferences');
    } finally {
      setPrefsSaving(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Please log in to manage your settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="space-y-10">
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="text-xl font-semibold mb-4">Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4" aria-describedby="profile-help">
              <div>
                <label htmlFor="username" className="block font-medium mb-1">Username</label>
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block font-medium mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section aria-labelledby="notif-heading">
            <h2 id="notif-heading" className="text-xl font-semibold mb-4">Notifications</h2>
            {prefs ? (
              <form onSubmit={savePrefs} className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="push_enabled"
                    type="checkbox"
                    checked={prefs.push_enabled}
                    onChange={(e) => setPrefs({ ...prefs, push_enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="push_enabled">Enable push notifications</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="alerts_enabled"
                    type="checkbox"
                    checked={prefs.alerts_enabled}
                    onChange={(e) => setPrefs({ ...prefs, alerts_enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="alerts_enabled">Enable critical alerts</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="marketing_enabled"
                    type="checkbox"
                    checked={prefs.marketing_enabled}
                    onChange={(e) => setPrefs({ ...prefs, marketing_enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="marketing_enabled">Receive product updates</label>
                </div>
                <fieldset className="border rounded p-3">
                  <legend className="font-medium">Quiet hours</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <div>
                      <label htmlFor="qh_start" className="block text-sm mb-1">Start</label>
                      <input
                        id="qh_start"
                        type="time"
                        value={prefs.quiet_hours.start || ''}
                        onChange={(e) => setPrefs({ ...prefs, quiet_hours: { ...prefs.quiet_hours, start: e.target.value || null } })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="qh_end" className="block text-sm mb-1">End</label>
                      <input
                        id="qh_end"
                        type="time"
                        value={prefs.quiet_hours.end || ''}
                        onChange={(e) => setPrefs({ ...prefs, quiet_hours: { ...prefs.quiet_hours, end: e.target.value || null } })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="qh_tz" className="block text-sm mb-1">Timezone</label>
                      <input
                        id="qh_tz"
                        type="text"
                        placeholder="e.g. UTC or America/New_York"
                        value={prefs.quiet_hours.timezone || ''}
                        onChange={(e) => setPrefs({ ...prefs, quiet_hours: { ...prefs.quiet_hours, timezone: e.target.value || null } })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                </fieldset>
                <button
                  type="submit"
                  disabled={prefsSaving}
                  className="inline-flex items-center px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60"
                >
                  {prefsSaving ? 'Saving…' : 'Save Preferences'}
                </button>
              </form>
            ) : (
              <p>Loading preferences…</p>
            )}
          </section>

          {message && (
            <div role="status" className="text-sm text-gray-700">{message}</div>
          )}
        </div>
      )}
    </div>
  );
}


