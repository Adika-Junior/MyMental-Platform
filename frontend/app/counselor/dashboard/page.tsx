'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { getAccessToken } from '@/lib/auth';

interface CrisisAlert {
  id: number;
  user: string;
  message: string;
  severity: number;
  severity_display: string;
  matched_keywords: string[];
  status: string;
  created_at: string;
  escalated_to: string | null;
}

interface Conversation {
  id: number;
  session_id: string;
  user: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  summary: string | null;
  escalated_to: string | null;
}

export default function CounselorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'alerts' | 'conversations'>('alerts');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'acknowledged' | 'resolved'>('pending');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Redirect if not counselor/admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const userType = (user as any).user_type || 'client';
      if (userType !== 'counselor' && userType !== 'admin') {
        router.push('/');
      }
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchAlerts = async (status: string = 'pending') => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/chatbot/alerts/?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/chatbot/escalated/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'alerts') {
      fetchAlerts(selectedTab);
    } else {
      fetchConversations();
    }
  }, [selectedTab, viewMode]);

  const fetchConversationDetails = async (sessionId: string) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/chatbot/counselor/${sessionId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setConversationMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const handleGenerateSummary = async (sessionId: string) => {
    setSummaryLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/chatbot/counselor/${sessionId}/summary/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        // Update conversation in list
        setConversations(prev => prev.map(c => 
          c.session_id === sessionId ? { ...c, summary: data.summary } : c
        ));
        if (selectedConversation?.session_id === sessionId) {
          setSelectedConversation({ ...selectedConversation, summary: data.summary });
        }
        alert('Summary generated successfully!');
      } else {
        alert('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Error generating summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/chatbot/alerts/${alertId}/acknowledge/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh alerts
        fetchAlerts(selectedTab);
      } else {
        alert('Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Error acknowledging alert');
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return '#dc2626'; // red
    if (severity >= 7) return '#ea580c'; // orange
    if (severity >= 5) return '#ca8a04'; // yellow
    return '#65a30d'; // green
  };

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <ResponsiveHeader />

        <div style={{ marginTop: '100px', padding: '2rem', maxWidth: '1400px', margin: '100px auto 2rem auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Counselor Dashboard
            </h1>
            <p style={{ color: '#6b7280' }}>
              Manage crisis alerts and assigned conversations
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('alerts')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                color: viewMode === 'alerts' ? '#4f46e5' : '#6b7280',
                borderBottom: viewMode === 'alerts' ? '3px solid #4f46e5' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: viewMode === 'alerts' ? 600 : 400,
                fontSize: '1rem'
              }}
            >
              Crisis Alerts ({alerts.filter(a => a.status === 'pending').length} pending)
            </button>
            <button
              onClick={() => setViewMode('conversations')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                color: viewMode === 'conversations' ? '#4f46e5' : '#6b7280',
                borderBottom: viewMode === 'conversations' ? '3px solid #4f46e5' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: viewMode === 'conversations' ? 600 : 400,
                fontSize: '1rem'
              }}
            >
              Escalated Conversations ({conversations.length})
            </button>
          </div>

          {/* Alert Tabs (only shown when in alerts mode) */}
          {viewMode === 'alerts' && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              {(['pending', 'acknowledged', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: 'transparent',
                    color: selectedTab === tab ? '#4f46e5' : '#6b7280',
                    borderBottom: selectedTab === tab ? '3px solid #4f46e5' : '3px solid transparent',
                    cursor: 'pointer',
                    fontWeight: selectedTab === tab ? 600 : 400,
                    fontSize: '1rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab} ({alerts.filter(a => a.status === tab).length})
                </button>
              ))}
            </div>
          )}

          {/* Conversations View */}
          {viewMode === 'conversations' && (
            <>
              {conversations.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  padding: '3rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                    No escalated conversations found
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: '4px solid #6366f1'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                              Conversation with {conv.user}
                            </h3>
                            {conv.escalated_to && (
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 500
                              }}>
                                Assigned to: {conv.escalated_to}
                              </span>
                            )}
                          </div>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            Session ID: {conv.session_id}
                          </p>
                          {conv.summary && (
                            <div style={{
                              backgroundColor: '#f9fafb',
                              padding: '1rem',
                              borderRadius: '8px',
                              marginTop: '0.75rem'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                Summary:
                              </p>
                              <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '0.875rem' }}>
                                {conv.summary}
                              </p>
                            </div>
                          )}
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            Updated: {new Date(conv.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <button
                            onClick={() => {
                              setSelectedConversation(conv);
                              fetchConversationDetails(conv.session_id);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#4f46e5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#6366f1';
                            }}
                          >
                            View Messages
                          </button>
                          <button
                            onClick={() => handleGenerateSummary(conv.session_id)}
                            disabled={summaryLoading}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: conv.summary ? '#10b981' : '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: summaryLoading ? 'not-allowed' : 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              whiteSpace: 'nowrap',
                              opacity: summaryLoading ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!summaryLoading) {
                                e.currentTarget.style.backgroundColor = conv.summary ? '#059669' : '#d97706';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!summaryLoading) {
                                e.currentTarget.style.backgroundColor = conv.summary ? '#10b981' : '#f59e0b';
                              }
                            }}
                          >
                            {summaryLoading ? 'Generating...' : conv.summary ? 'Regenerate Summary' : 'Generate Summary'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conversation Detail Modal */}
              {selectedConversation && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                  }}
                  onClick={() => {
                    setSelectedConversation(null);
                    setConversationMessages([]);
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      maxWidth: '800px',
                      width: '100%',
                      maxHeight: '80vh',
                      overflow: 'auto',
                      padding: '2rem'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        Conversation with {selectedConversation.user}
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedConversation(null);
                          setConversationMessages([]);
                        }}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Session: {selectedConversation.session_id}
                      </p>
                      {selectedConversation.summary && (
                        <div style={{
                          backgroundColor: '#f9fafb',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginTop: '1rem'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                            Summary:
                          </p>
                          <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '0.875rem' }}>
                            {selectedConversation.summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {conversationMessages.length === 0 ? (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                          Loading messages...
                        </p>
                      ) : (
                        conversationMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: msg.message_type === 'user' ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div
                              style={{
                                maxWidth: '70%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: msg.message_type === 'user' ? '#6366f1' : '#e5e7eb',
                                color: msg.message_type === 'user' ? 'white' : '#1f2937'
                              }}
                            >
                              <p style={{ marginBottom: '0.25rem' }}>{msg.content}</p>
                              <p style={{
                                fontSize: '0.75rem',
                                opacity: 0.7,
                                textAlign: msg.message_type === 'user' ? 'right' : 'left'
                              }}>
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Alerts List */}
          {viewMode === 'alerts' && alerts.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                No {selectedTab} alerts found
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: getSeverityColor(alert.severity) + '20',
                          color: getSeverityColor(alert.severity),
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          {alert.severity_display} ({alert.severity}/10)
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
                        Alert from: {alert.user}
                      </h3>
                      <p style={{ color: '#4b5563', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                        {alert.message}
                      </p>
                      {alert.matched_keywords.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '0.5rem' }}>
                            Keywords:
                          </span>
                          {alert.matched_keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                marginRight: '0.5rem',
                                color: '#374151'
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        style={{
                          padding: '0.5rem 1.5rem',
                          backgroundColor: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4338ca';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'acknowledged' && alert.escalated_to && (
                      <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Assigned to: {alert.escalated_to}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

