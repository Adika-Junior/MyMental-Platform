'use client';

import { useState } from 'react';
import { apiPost, ApiError } from '@/lib/api';
import Link from 'next/link';

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResetToken(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/password/reset/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // In development, show token. In production, this won't be in response
        if (data.reset_token) {
          setResetToken(data.reset_token);
        }
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">Enter your email address to receive a password reset link</p>
          </div>

          {success ? (
            <div className="mt-6">
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-medium">Reset link sent!</p>
                <p className="text-sm mt-2">
                  If an account exists with this email, a reset link has been sent.
                </p>
              </div>

              {resetToken && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Development Mode:</strong> Your reset token (use this in the confirm page):
                  </p>
                  <code className="block text-xs bg-white p-2 rounded border break-all">
                    {resetToken}
                  </code>
                  <Link
                    href={`/reset-password/confirm?token=${resetToken}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Go to reset confirmation →
                  </Link>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Remember your password? Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

