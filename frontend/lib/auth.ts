let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  return null;
}

export function clearTokens() {
  inMemoryAccessToken = null;
  if (typeof window !== 'undefined') {
    // Backward compatibility: remove legacy token storage.
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userLoggedIn');
  }
}


