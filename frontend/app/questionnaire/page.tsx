'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { useState } from 'react';

export default function QuestionnairePage() {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [mainConcerns, setMainConcerns] = useState('');
  const [goals, setGoals] = useState('');
  const [hasCrisisHistory, setHasCrisisHistory] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetchWithAuth('http://localhost:8000/api/chatbot/questionnaire/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          stress_level: stress,
          main_concerns: mainConcerns,
          goals,
          has_crisis_history: hasCrisisHistory,
          consent_to_contact: consent,
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setMainConcerns('');
        setGoals('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <ResponsiveHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Pre-therapy Questionnaire</h1>
        {submitted && <div className="mb-4 text-green-700">Thank you! Your responses were submitted.</div>}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Mood</span>
            <select value={mood} onChange={(e) => setMood(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value={1}>Very Sad</option>
              <option value={2}>Sad</option>
              <option value={3}>Neutral</option>
              <option value={4}>Happy</option>
              <option value={5}>Very Happy</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Stress level</span>
            <select value={stress} onChange={(e) => setStress(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value={1}>Very Low</option>
              <option value={2}>Low</option>
              <option value={3}>Moderate</option>
              <option value={4}>High</option>
              <option value={5}>Very High</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Main concerns</span>
            <textarea value={mainConcerns} onChange={(e) => setMainConcerns(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[120px]" placeholder="What would you like to talk about?" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Goals (optional)</span>
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[80px]" placeholder="What outcomes would you hope for?" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hasCrisisHistory} onChange={(e) => setHasCrisisHistory(e.target.checked)} />
            <span>Past crisis history</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I consent to be contacted about my responses</span>
          </label>
          <div>
            <button onClick={submit} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}


