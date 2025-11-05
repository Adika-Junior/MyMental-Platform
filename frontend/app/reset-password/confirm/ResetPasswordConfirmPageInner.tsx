import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordConfirmPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get token from URL query or use default
    const urlToken = searchParams.get('token') || '';
    setToken(urlToken);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // Client-side validation
    if (formData.new_password !== formData.new_password_confirm) {
      setErrors({ new_password_confirm: 'Passwords do not match' });
      return;
    }

    if (formData.new_password.length < 8) {
      setErrors({ new_password: 'Password must be at least 8 characters long' });
      return;
    }

    if (!token) {
      setErrors({ token: 'Reset token is required' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/password/reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          new_password: formData.new_password,
          new_password_confirm: formData.new_password_confirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        if (data.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            formattedErrors[key] = Array.isArray(value) ? value[0] : String(value);
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ general: data.message || 'Failed to reset password' });
        }
      }
    } catch (err) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {success ? (
            <div className="mt-6">
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-medium">Password reset successfully!</p>
                <p className="text-sm mt-2">Redirecting to login page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.general}
                </div>
              )}

              {!token && (
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                    Reset Token *
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.token ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter reset token"
                  />
                  {errors.token && (
                    <p className="text-sm text-red-600 mt-1">{errors.token}</p>
                  )}
                </div>
              )}

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

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
