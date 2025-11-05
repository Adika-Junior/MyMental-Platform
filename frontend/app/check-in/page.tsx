'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckInPage() {
  const [mood, setMood] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad' },
    { value: 2, emoji: '😔', label: 'Sad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '😊', label: 'Happy' },
    { value: 5, emoji: '😄', label: 'Very Happy' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Example: You may want to send the mood and notes to an API here
    setSubmitted(true);
    setTimeout(() => {
      setNotes('');
      setMood(3);
      setSubmitted(false);
    }, 2000);
  };
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white" style={{
        backgroundImage: 'url(/images/about-bg.jpg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}>
        <ResponsiveHeader />
        <div style={{
          marginTop: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)',
          padding: '2rem',
          width: '90%',
          marginLeft: '5%'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            padding: '2rem',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#4338ca',
              marginBottom: '0.5rem'
            }}>
              Emotional Check-In
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Take a moment to reflect on how you're feeling today
            </p>
            {submitted && (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#166534', fontWeight: 600 }}>✓ Check-in recorded successfully!</p>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mood Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  How are you feeling today?
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '1rem'
                }}>
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(m.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: `2px solid ${mood === m.value ? '#4f46e5' : '#e5e7eb'}`,
                        backgroundColor: mood === m.value ? '#eef2ff' : 'white',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        transform: mood === m.value ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                      <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{m.emoji}</span>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Notes */}
              <div>
                <label htmlFor="notes" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Anything you'd like to share? (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="How has your day been? What's on your mind?"
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Save Check-In
              </button>
            </form>
            {/* Quick Actions */}
            <div style={{
              marginTop: '2rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Quick Actions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem'
              }}>
                <Link href="/chat" style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}>
                  Start Chat
                </Link>
                <Link href="/about" style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}>
                  Resources
                </Link>
                <Link href="/" style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}>
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
