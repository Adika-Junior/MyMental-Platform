'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, setAccessToken, clearTokens } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  user_type?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    // Try cookie first, then localStorage for backward compatibility
    const cookies = document.cookie.split(';');
    const refreshCookie = cookies.find(c => c.trim().startsWith('refresh_token='));
    if (refreshCookie) {
      return refreshCookie.split('=')[1];
    }
    return localStorage.getItem('refreshToken');
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    
    try {
      const res = await fetch('http://localhost:8000/api/users/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ refresh }),
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      if (data.access) {
        setAccessToken(data.access);
        return data.access;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const fetchUser = async (): Promise<User | null> => {
    let token = getAccessToken();
    
    // If no token, try to refresh
    if (!token) {
      token = await refreshAccessToken();
      if (!token) return null;
    }

    try {
      const res = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        // Try refreshing token
        const newToken = await refreshAccessToken();
        if (!newToken) {
          clearTokens();
          return null;
        }
        
        // Retry with new token
        const retryRes = await fetch('http://localhost:8000/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
          credentials: 'include',
        });
        
        if (!retryRes.ok) {
          clearTokens();
          return null;
        }
        
        const userData = await retryRes.json();
        return userData;
      }

      if (!res.ok) {
        clearTokens();
        return null;
      }

      const userData = await res.json();
      return userData;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);
      const userData = await fetchUser();
      
      if (mounted) {
        setUser(userData);
        setIsAuthenticated(!!userData);
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Login failed' }));
        return { success: false, error: error.detail || 'Login failed' };
      }

      const data = await res.json();
      if (data.access) {
        setAccessToken(data.access);
        // Fetch user data
        const userData = await fetchUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      return { success: false, error: 'Failed to authenticate' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    login,
    refreshToken: refreshAccessToken,
  };
}

