/**
 * API helper functions with automatic token management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

import { getAccessToken, setAccessToken, clearTokens } from './auth';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}), // Cookie will be used
    });
    
    if (!res.ok) return false;
    
    const data = await res.json();
    if (data.access) {
      setAccessToken(data.access);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  // Safely convert any headers type to Record<string, string>
  let mergedHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        mergedHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        mergedHeaders[key] = value;
      });
    } else {
      mergedHeaders = { ...mergedHeaders, ...options.headers };
    }
  }

  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
    credentials: 'include',
  });

  // If 401, try to refresh token and retry once
  if (response.status === 401 && token) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        mergedHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers: mergedHeaders,
          credentials: 'include',
        });
      }
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  
  return response;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE}${endpoint}`);
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw error;
  }
  
  return response.json();
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw error;
  }
  
  return response.json();
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw error;
  }
  
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw error;
  }
  
  return response.json();
}

