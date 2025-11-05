import { fetchWithAuth, getBaseUrl } from './auth';

export async function startConversation() {
  const res = await fetchWithAuth(`${getBaseUrl()}/api/chatbot/start/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to start conversation');
  return res.json() as Promise<{ session_id: string }>; 
}

export async function sendMessage(sessionId: string, message: string) {
  const res = await fetchWithAuth(`${getBaseUrl()}/api/chatbot/send/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json() as Promise<{ bot_response: string; crisis_detected: boolean }>; 
}

export async function getConversation(sessionId: string) {
  const res = await fetchWithAuth(`${getBaseUrl()}/api/chatbot/${sessionId}/`);
  if (!res.ok) throw new Error('Failed to get conversation');
  return res.json() as Promise<{ conversation: any[]; session_id: string }>; 
}

export async function registerNotificationToken(token: string, platform: string = 'web') {
  const res = await fetchWithAuth(`${getBaseUrl()}/api/chatbot/notifications/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform })
  });
  return res.ok;
}


