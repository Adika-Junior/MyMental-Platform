'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiPost, ApiError } from '@/lib/api';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useState(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    // Client-side validation
    if (formData.new_password !== formData.new_password_confirm) {
      setErrors({ new_password_confirm: 'New passwords do not match' });
      return;
    }

    if (formData.new_password.length < 8) {
      setErrors({ new_password: 'Password must be at least 8 characters long' });
      return;
    }

    setSaving(true);

    try {
      await apiPost('/users/password/change/', formData);
      setSuccess('Password changed successfully!');
      setFormData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        const formattedErrors: Record<string, string> = {};
        Object.entries(apiError.errors).forEach(([key, value]) => {
          formattedErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ general: apiError.message || 'Failed to change password' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Change Password</h1>

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <input
                id="old_password"
                name="old_password"
                type="password"
                value={formData.old_password}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.old_password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.old_password && (
                <p className="text-sm text-red-600 mt-1">{errors.old_password}</p>
              )}
            </div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleInputChange}
                required
                minLength={8}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.new_password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.new_password && (
                <p className="text-sm text-red-600 mt-1">{errors.new_password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="new_password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                id="new_password_confirm"
                name="new_password_confirm"
                type="password"
                value={formData.new_password_confirm}
                onChange={handleInputChange}
                required
                minLength={8}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.new_password_confirm ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.new_password_confirm && (
                <p className="text-sm text-red-600 mt-1">{errors.new_password_confirm}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
              <Link
                href="/profile"
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition flex items-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

