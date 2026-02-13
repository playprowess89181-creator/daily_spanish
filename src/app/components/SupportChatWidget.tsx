'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { usePathname } from 'next/navigation';

const API_SUPPORT_BASE = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/support';

type Message = {
  id: string;
  side: 'user' | 'admin';
  content: string;
  created_at: string;
  author_name?: string;
  author_email?: string;
};

type Thread = {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
  updated_at?: string;
};

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function SupportChatWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [outgoing, setOutgoing] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const token = useAccessToken();

  const toggleOpen = () => {
    setOpen(prev => !prev);
  };

  const startPolling = (threadId: string) => {
    stopPolling();
    pollRef.current = setInterval(() => {
      fetchMessages(threadId);
      fetchThread(threadId);
    }, 2000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchMessages = async (threadId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${threadId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // swallow transient errors
    }
  };

  const fetchThread = async (threadId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${threadId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveThread(data.thread);
      }
    } catch {
      // ignore transient errors
    }
  };

  useEffect(() => {
    if (open) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('active_support_thread') : null;
      if (stored) {
        try {
          const parsed: Thread = JSON.parse(stored);
          setActiveThread(parsed);
          fetchThread(parsed.id);
          fetchMessages(parsed.id);
          startPolling(parsed.id);
        } catch {}
      }
    } else {
      stopPolling();
    }
    // cleanup
    return () => stopPolling();
  }, [open]);

  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const shouldHide = !isAuthenticated || isAdminRoute || isAuthPage;
  if (shouldHide) {
    return null;
  }

  const createThread = async () => {
    if (!token) {
      setError('You must be logged in to contact support');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: initialTitle, message: initialMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error creating thread');
      }
      const thread = data.thread as Thread;
      setActiveThread(thread);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_support_thread', JSON.stringify(thread));
      }
      setInitialMessage('');
      setInitialTitle('');
      await fetchMessages(thread.id);
      startPolling(thread.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error creating thread';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!token || !activeThread || !outgoing.trim()) return;
    const content = outgoing.trim();
    setOutgoing('');
    setMessages(prev => [...prev, { id: `tmp_${Date.now()}`, side: 'user', content, created_at: new Date().toISOString(), author_name: user?.name || user?.nickname || user?.email, author_email: user?.email || '' }]);
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${activeThread.id}/messages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      } else {
        fetchMessages(activeThread.id);
      }
    } catch {
      setError('Network error');
    }
  };

  const closePopup = () => {
    setOpen(false);
  };

  const clearActiveThread = () => {
    stopPolling();
    setActiveThread(null);
    setMessages([]);
    setOutgoing('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('active_support_thread');
    }
  };

  return (
    <>
      <button
        aria-label="Open support"
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg btn-gradient text-white w-14 h-14 flex items-center justify-center"
      >
        <i className="fas fa-comments text-xl"></i>
      </button>

      {open && (
        <div className="fixed bottom-24 right-2 z-50 w-96 max-w-[95vw] bg-white rounded-xl shadow-2xl border border-neutral-200">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <i className="fas fa-life-ring text-blue-600"></i>
              <span className="font-semibold">Support</span>
            </div>
            <button onClick={closePopup} className="text-neutral-600 hover:text-neutral-900">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {!activeThread ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Title</label>
                <input
                  value={initialTitle}
                  onChange={(e) => setInitialTitle(e.target.value)}
                  placeholder="Short summary of your issue"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Message</label>
                <textarea
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe your question in detail"
                  rows={4}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={createThread}
                disabled={loading || !initialTitle.trim() || !initialMessage.trim()}
                className="w-full btn-gradient text-white px-3 py-2 rounded"
              >
                {loading ? 'Creating...' : 'Create thread and send'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-96">
              <div className="flex items-center justify-between px-4 py-2 text-xs border-b bg-neutral-50">
                <span className="font-medium">Status: {activeThread.status}</span>
                <span>{new Date(activeThread.created_at).toLocaleString()}</span>
              </div>
              {activeThread.status === 'closed' ? (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-neutral-700">This support thread is closed.</p>
                  <button onClick={clearActiveThread} className="w-full btn-gradient text-white px-3 py-2 rounded">Start a new thread</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map(m => (
                      <div key={m.id} className={`max-w-[85%] ${m.side === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`px-3 py-2 rounded-lg shadow ${m.side === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                          <div className="text-xs opacity-80 mb-1">{m.author_name || (m.side === 'user' ? 'You' : 'Support')}</div>
                          <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <input
                        value={outgoing}
                        onChange={(e) => setOutgoing(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                      <button onClick={sendMessage} className="btn-gradient text-white px-4 py-2 rounded">Send</button>
                    </div>
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
