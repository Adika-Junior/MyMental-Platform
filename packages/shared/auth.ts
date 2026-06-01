export type Tokens = { access: string };

export function getBaseUrl() {
  // Default to local backend; override via env if needed
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL as string;
  }
  return 'http://localhost:8000';
}

export async function login(username: string, password: string): Promise<Tokens> {
  const res = await fetch(`${getBaseUrl()}/api/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(username: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/users/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!res.ok) throw new Error('Registration failed');
}

async function refreshTokenFromCookie(): Promise<{ access: string }> {
  const res = await fetch(`${getBaseUrl()}/api/users/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

let accessToken: string | null = null;

export function setTokens(access: string) {
  accessToken = access;
}

export function getAccessToken() {
  return accessToken;
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = { ...(init.headers || {}), 'Authorization': `Bearer ${accessToken || ''}` } as Record<string, string>;
  let res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    try {
      const data = await refreshTokenFromCookie();
      accessToken = data.access || null;
      if (!accessToken) return res;
      const retryHeaders = { ...(init.headers || {}), 'Authorization': `Bearer ${accessToken}` } as Record<string, string>;
      res = await fetch(input, { ...init, headers: retryHeaders, credentials: 'include' });
    } catch {}
  }
  return res;
}


