export function createChatWebSocket(sessionId: string) {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8000';
  return new WebSocket(`${protocol}://${host}/ws/chatbot/${sessionId}/`);
}


