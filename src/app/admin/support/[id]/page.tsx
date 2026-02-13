'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { withAdminAuth } from '../../../../lib/AuthContext';
import { useParams } from 'next/navigation';

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
  updated_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
};

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function AdminThreadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [outgoing, setOutgoing] = useState('');
  const [loading, setLoading] = useState(true);
  const token = useAccessToken();
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const routeParams = useParams() as { id?: string };
  const id = routeParams?.id || '';

  const fetchThread = async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setThread(data.thread);
    } catch {}
  };

  const fetchMessages = async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${id}/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      await fetchThread();
      await fetchMessages();
      setLoading(false);
      pollRef.current = setInterval(fetchMessages, 2000);
    };
    init();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, id]);

  const sendMessage = async () => {
    if (!token || !outgoing.trim()) return;
    const content = outgoing.trim();
    setOutgoing('');
    setMessages(prev => [...prev, { id: `tmp_${Date.now()}`, side: 'admin', content, created_at: new Date().toISOString() }]);
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${id}/messages/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'No se pudo enviar');
      } else {
        fetchMessages();
      }
    } catch {
      alert('Error de red');
    }
  };

  const setStatus = async (statusValue: 'resolved' | 'closed') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_SUPPORT_BASE}/threads/${id}/close/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue }),
      });
      const data = await res.json();
      if (res.ok) setThread(data.thread);
    } catch {}
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="support" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title={thread ? thread.title : 'Thread'} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            {loading || !thread ? (
              <div className="p-6">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{thread.title}</div>
                    <div className="text-sm text-neutral-600">{thread.user_name} · {thread.user_email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${thread.status === 'open' ? 'bg-blue-600 text-white' : thread.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-900'}`}>{thread.status}</span>
                    <button onClick={() => setStatus('resolved')} className="btn-mint px-3 py-1 rounded">Resolve</button>
                    <button onClick={() => setStatus('closed')} className="btn-orange px-3 py-1 rounded">Close</button>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {messages.map(m => (
                    <div key={m.id} className={`max-w-[80%] ${m.side === 'admin' ? 'ml-auto' : 'mr-auto'}`}>
                      <div className={`px-3 py-2 rounded-lg shadow ${m.side === 'admin' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                        <div className="text-xs opacity-80 mb-1">{m.side === 'admin' ? 'You' : m.author_name || 'User'}</div>
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input value={outgoing} onChange={(e) => setOutgoing(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Reply..."/>
                    <button onClick={sendMessage} className="btn-gradient text-white px-4 py-2 rounded">Send</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminThreadPage);
