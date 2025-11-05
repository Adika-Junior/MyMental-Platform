import { getAccessToken, setAccessToken } from '@/lib/auth';

const GRAPHQL_ENDPOINT = 'http://localhost:8000/api/graphql/';

export async function gqlFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = getAccessToken();
  let res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ query, variables })
  });

  // If unauthorized, try refresh then retry (REST refresh issues httpOnly cookie)
  if (res.status === 401) {
    const refreshRes = await fetch('http://localhost:8000/api/users/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (data?.access) setAccessToken(data.access);
      const retryToken = getAccessToken();
      res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(retryToken ? { Authorization: `Bearer ${retryToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ query, variables })
      });
    }
  }

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }
  const payload = await res.json();
  if (payload.errors) {
    throw new Error(payload.errors.map((e: any) => e.message).join('; '));
  }
  return payload.data as T;
}


