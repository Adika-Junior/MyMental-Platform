'use client';

import { useState, useEffect, useRef } from 'react';
import { getAccessToken, setAccessToken } from '@/lib/auth';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Message {
  id: number;
  message_type: 'user' | 'bot';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wsEnabled, setWsEnabled] = useState(true);
  const [theme, setTheme] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('chat_theme') || 'calm' : 'calm'));
  const [riskLevel, setRiskLevel] = useState<number | null>(null);
  const [riskLabel, setRiskLabel] = useState<string | null>(null);
  const [supportNote, setSupportNote] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth helpers
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('http://localhost:8000/api/users/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access) {
        setAccessToken(data.access);
        return data.access as string;
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchWithAuth = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = getAccessToken();
    const headers = {
      ...(init.headers || {}),
      'Authorization': `Bearer ${token || ''}`,
    } as Record<string, string>;
    let res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryHeaders = { ...(init.headers || {}), 'Authorization': `Bearer ${newToken}` } as Record<string, string>;
        res = await fetch(input, { ...init, headers: retryHeaders });
      }
    }
    return res;
  };

  useEffect(() => {
    // Restore existing sessionId if available
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('chat_session_id') || localStorage.getItem('chat_session_id');
      if (existing) {
        setSessionId(existing);
      }
    }

    // Start conversation if no existing
    const startConversation = async () => {
      try {
        if (sessionId) return; // already have a session
        const response = await fetchWithAuth('http://localhost:8000/api/chatbot/start/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          console.log('Backend not available, using demo mode. Status:', response.status);
          // Use a demo session ID when backend is not available
          setSessionId('demo-session-' + Date.now());
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Backend not available, using demo mode');
          setSessionId('demo-session-' + Date.now());
          return;
        }
        
        const data = await response.json();
        setSessionId(data.session_id);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('chat_session_id', data.session_id);
          localStorage.setItem('chat_session_id', data.session_id);
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    };

    startConversation();
  }, []);

  // Load history when sessionId is set
  useEffect(() => {
    if (!sessionId) return;
    // Connect WebSocket if enabled
    if (wsEnabled) {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${protocol}://localhost:8000/ws/chatbot/${sessionId}/`);
        wsRef.current = ws;
        ws.onopen = () => {
          // Send joined event
          ws.send(JSON.stringify({ message: 'joined' }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.message && typeof data.message === 'string') {
              // Treat broadcast as bot message
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  message_type: 'bot',
                  content: data.message,
                  created_at: new Date().toISOString(),
                },
              ]);
            }
          } catch {}
        };
        ws.onclose = () => {
          wsRef.current = null;
        };
      } catch {}
    }
    const loadHistory = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/chatbot/${sessionId}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return;
        const data = await res.json();
        const history = (data.conversation || []).map((m: any, idx: number) => ({
          id: Date.now() + idx,
          message_type: m.message_type,
          content: m.content,
          created_at: m.created_at,
        })) as Message[];
        setMessages(history.reverse());
      } catch {}
    };
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now(),
      message_type: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Also send over WebSocket for real-time echo/typing indicators
      if (wsEnabled && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: input }));
      }
      const response = await fetchWithAuth('http://localhost:8000/api/chatbot/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: input,
        }),
      });

      if (!response.ok) {
        // Handle backend not available - use demo response
        const botMessage: Message = {
          id: Date.now() + 1,
          message_type: 'bot',
          content: 'I understand you said: "' + input + '". This is a demo response. Please connect to the backend for full functionality.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Handle non-JSON response - use demo response
        const botMessage: Message = {
          id: Date.now() + 1,
          message_type: 'bot',
          content: 'I understand you said: "' + input + '". This is a demo response. Please connect to the backend for full functionality.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        message_type: 'bot',
        content: data.bot_response || 'Sorry, I encountered an error.',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (typeof data.risk_level === 'number') {
        setRiskLevel(data.risk_level);
      } else {
        setRiskLevel(null);
      }
      if (typeof data.risk_label === 'string') {
        setRiskLabel(data.risk_label);
      } else {
        setRiskLabel(null);
      }
      if (typeof data.rationale === 'string') {
        setSupportNote(data.rationale);
      } else {
        setSupportNote(null);
      }

      if (data.crisis_detected) {
        alert('Your message has been flagged for immediate attention. Please contact emergency services if this is an emergency.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Provide a demo response when backend is unavailable
      const demoMessage: Message = {
        id: Date.now() + 1,
        message_type: 'bot',
        content: 'I understand you said: "' + input + '". This is a demo response. Please connect to the backend for full functionality.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, demoMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <div className={`bg-white min-h-screen ${theme === 'calm' ? '' : theme === 'bubbles' ? 'bubble-bg' : ''}`} style={{
        backgroundImage: 'url(/images/about-bg.jpg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}>
        {/* Responsive Header */}
        <ResponsiveHeader />

      {/* Left Sidebar with Quotes */}
      <div style={{
        position: 'absolute',
        left: '5%',
        top: '15%',
        width: '25%',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#006eff',
        fontFamily: 'serif',
        zIndex: 5
      }}>
        <div style={{
          backgroundColor: 'rgb(247,160,0)',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>
            #My Mental Health Matters
          </p>
        </div>
        <p style={{ margin: '15px 0' }}>
          "It's okay to have bad days and ask for support when you need it."
        </p>
        <p style={{ color: 'rgb(122,4,4)', fontFamily: 'monospace', margin: '15px 0' }}>
          "You are not a burden for seeking help for your mental health."
        </p>
        <p style={{ color: 'rgb(85,86,156)', fontFamily: 'monospace', margin: '15px 0' }}>
          "Your mental health is just as important as your career or education."
        </p>
      </div>

      {/* Chat Container - Reduced Width, Moved to Right */}
      <div style={{
        width: '60%',
        marginLeft: '35%',
        marginTop: '100px',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#f3f4f6',
          minHeight: '65vh',
          maxWidth: '700px',
          margin: '0 auto',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #ddd',
            background: 'linear-gradient(to right, #9333ea, #0891b2)',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <img 
                src="/images/mymental_logo.png" 
                alt="Chatbot"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
              <h3 style={{
                fontSize: '1.5rem',
                background: 'linear-gradient(to right, #b121f3, #44eee0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'white',
                fontWeight: 'bold'
              }}>
                MYMENTAL Chatbot
              </h3>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'white',
              textAlign: 'center',
              marginTop: '8px'
            }}>
              Remember: This is not a substitute for professional therapy
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <label style={{ color: 'white', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={wsEnabled} onChange={(e) => setWsEnabled(e.target.checked)} style={{ marginRight: 6 }} />
                Real-time mode
              </label>
              <select
                value={theme}
                onChange={(e) => { setTheme(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('chat_theme', e.target.value); }}
                style={{ fontSize: '0.8rem', borderRadius: 6, padding: '2px 6px' }}
              >
                <option value="calm">Calm</option>
                <option value="bubbles">Bubbles</option>
                <option value="fade">Fade</option>
              </select>
            </div>
          </div>

          {/* Risk / support banner */}
          {riskLevel && (
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor:
                  riskLevel === 3 ? '#fee2e2' :
                  riskLevel === 2 ? '#fef3c7' :
                  '#ecfdf5',
              }}
            >
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: supportNote ? 4 : 0,
                  color:
                    riskLevel === 3 ? '#b91c1c' :
                    riskLevel === 2 ? '#92400e' :
                    '#047857',
                }}
              >
                {riskLevel === 3 && 'High risk pattern detected – a counselor may review this conversation.'}
                {riskLevel === 2 && 'Moderate risk pattern detected – we are keeping an extra eye on your wellbeing.'}
                {riskLevel === 1 && 'Low risk – providing general emotional support.'}
              </p>
              {supportNote && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#4b5563',
                    lineHeight: 1.4,
                  }}
                >
                  {supportNote}
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={{
            height: '50vh',
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '1rem',
            backgroundColor: '#f9fafb'
          }}>
            <div ref={messagesEndRef} />
            
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1rem',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                <div style={{
                  backgroundColor: '#e5e7eb',
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.2s' }}></div>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                margin: '2rem 0'
              }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Start a conversation...</p>
                <p style={{ color: '#9ca3af' }}>I'm here to listen and support you.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  marginBottom: '1rem',
                  justifyContent: message.message_type === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: message.message_type === 'user' ? '#00a8f7' : '#e5e7eb',
                    color: message.message_type === 'user' ? 'white' : '#1f2937',
                    borderTopRightRadius: message.message_type === 'user' ? '0.25rem' : '1rem',
                    borderTopLeftRadius: message.message_type === 'bot' ? '0.25rem' : '1rem',
                    transition: theme === 'fade' ? 'opacity 0.3s ease, transform 0.3s ease' : undefined
                  }}
                >
                  <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  <div style={{ marginTop: '6px', opacity: 0.7, fontSize: '0.7rem', textAlign: message.message_type === 'user' ? 'right' : 'left' }}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a message..."
                style={{
                  flex: 1,
                  border: '2px solid #9ca3af',
                  borderRadius: '9999px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                disabled={loading || !sessionId}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !sessionId || !input.trim()}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  fontSize: '1.125rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: (loading || !sessionId || !input.trim()) ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .bubble-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 10% 20%, rgba(0,168,247,0.08), transparent 40%),
                      radial-gradient(circle at 80% 10%, rgba(147,51,234,0.08), transparent 35%),
                      radial-gradient(circle at 30% 80%, rgba(8,145,178,0.08), transparent 35%);
          pointer-events: none;
          animation: subtle-move 12s ease-in-out infinite alternate;
        }
        @keyframes subtle-move {
          0% { transform: translateY(0px); filter: hue-rotate(0deg); }
          100% { transform: translateY(10px); filter: hue-rotate(10deg); }
        }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
