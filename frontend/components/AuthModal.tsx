'use client';

import { useState } from 'react';
import { setAccessToken } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    username: '', 
    password: '', 
    repeatPassword: '', 
    email: '', 
    phone: '' 
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store access in memory; refresh is in httpOnly cookie set by backend
        if (data.access) setAccessToken(data.access);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userLoggedIn', 'true');
        }
        onClose();
        // Reload to update auth state across components
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (signupForm.password !== signupForm.repeatPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupForm.username,
          password: signupForm.password,
          email: signupForm.email,
          phone_number: signupForm.phone,
        }),
      });

      if (response.ok) {
        // After successful registration, optionally auto-login
        try {
          const loginRes = await fetch('http://localhost:8000/api/users/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: signupForm.username, password: signupForm.password })
          });
          if (loginRes.ok) {
            const tokens = await loginRes.json();
            if (tokens.access) setAccessToken(tokens.access);
            if (typeof window !== 'undefined') sessionStorage.setItem('userLoggedIn', 'true');
          }
        } catch {}
        onClose();
        // Reload to update auth state across components
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        let message = 'Please try again.';
        try {
          const error = await response.json();
          message = error?.detail || JSON.stringify(error);
        } catch {}
        alert(`Signup failed: ${message}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-3xl"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-4 px-6 text-center font-semibold ${
              activeTab === 'signin'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 px-6 text-center font-semibold ${
              activeTab === 'signup'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-600">Keep me signed in</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
            <div className="mt-4 text-center">
              <a href="#forgot" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.username}
                onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="signup-phone"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="signup-repeat-password" className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Password
              </label>
              <input
                id="signup-repeat-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.repeatPassword}
                onChange={(e) => setSignupForm({ ...signupForm, repeatPassword: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="text-sm text-blue-500 hover:underline"
              >
                Already a member?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

