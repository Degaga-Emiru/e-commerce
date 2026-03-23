'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Notification { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetch = async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications/unread'),
        api.get('/notifications/count'),
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch {}
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markRead = async (id: number) => {
    try { await api.put(`/notifications/${id}/read`); fetch(); } catch {}
  };

  const markAll = async () => {
    try { await api.put('/notifications/read-all'); fetch(); } catch {}
  };

  if (!isAuthenticated) return null;

  const typeColor: Record<string, string> = { SHIPPING: '#06b6d4', PAYMENT: '#10b981', ORDER_UPDATE: '#6366f1', SYSTEM: '#f59e0b' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', borderRadius: '100%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', margin: 0 }}>No new notifications</p>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)'}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[n.type] || '#6366f1', marginTop: 6, flexShrink: 0, opacity: n.isRead ? 0 : 1 }} />
                  <div>
                    <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                    <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: 13, lineHeight: 1.4 }}>{n.message}</p>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: 11 }}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
