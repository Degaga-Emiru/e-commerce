'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell, Package, CreditCard, Info, Check } from 'lucide-react';
import { notificationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Notification { 
  id: number; 
  title: string; 
  message: string; 
  type: string; 
  isRead: boolean; 
  createdAt: string; 
}

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
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (e) {
        console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => { 
    fetch(); 
    const t = setInterval(fetch, 15000); // 15s polling
    return () => clearInterval(t); 
  }, [isAuthenticated]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markRead = async (id: number) => {
    try { 
        await notificationApi.markAsRead(id); 
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  };

  const markAll = async () => {
    try { 
        await notificationApi.markAllAsRead(); 
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    } catch {}
  };

  if (!isAuthenticated) return null;

  const getIcon = (type: string) => {
      switch(type) {
          case 'SHIPPING': return <Package size={14} color="#06b6d4" />;
          case 'PAYMENT': return <CreditCard size={14} color="#10b981" />;
          default: return <Info size={14} color="#6366f1" />;
      }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 12, cursor: 'pointer', padding: '0.6rem', display: 'flex', alignItems: 'center', color: '#475569', transition:'all 0.2s' }}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#f97316', color: '#fff', borderRadius: '100%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border:'2px solid #fff' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 340, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, color: '#1e293b', fontWeight: 800, fontSize:15 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, cursor: 'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:4 }}>
                <Check size={14} /> Clear all
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#94a3b8' }}>
                <Bell size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>No new notifications</p>
              </div>
            ) : notifications.slice(0, 10).map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.03)', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: 8, borderRadius: 10, background: 'rgba(0,0,0,0.02)', marginTop: 2 }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#1e293b', fontWeight: 700, fontSize: 13.5 }}>{n.title}</p>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: 12.5, lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', marginTop: 8 }} />}
                </div>
              </div>
            ))}
          </div>
          <Link href="/notifications" style={{ display: 'block', textAlign: 'center', padding: '1rem', color: '#1e293b', fontSize: 13, fontWeight: 700, borderTop: '1px solid #f1f5f9', textDecoration: 'none', background:'#f8fafc' }}>
            View Full Inbox
          </Link>
        </div>
      )}
    </div>
  );
}
