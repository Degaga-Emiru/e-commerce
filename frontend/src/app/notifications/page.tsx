'use client';
import { useEffect, useState } from 'react';
import { notificationApi } from '@/services/api';
import { Bell, Package, CreditCard, Info, Check, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHIPPING': return <Package size={20} className="text-cyan-500" />;
      case 'PAYMENT': return <CreditCard size={20} className="text-emerald-500" />;
      default: return <Info size={20} className="text-indigo-500" />;
    }
  };

  if (!isAuthenticated) return <div className="p-20 text-center text-gray-500">Please login to view notifications.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Inbox</h1>
            <p className="text-gray-500 font-medium">Stay updated with your latest alerts</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllRead}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Check size={18} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Searching for alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-xl shadow-gray-200/50">
            <Bell size={64} className="mx-auto mb-6 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto">We'll let you know when something important happens with your orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`group bg-white p-6 rounded-3xl border transition-all ${!n.isRead ? 'border-indigo-500/30 bg-indigo-50/10 shadow-lg shadow-indigo-500/5' : 'border-gray-100'}`}
              >
                <div className="flex gap-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 self-start">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{n.title}</h4>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                        <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed mb-4">{n.message}</p>
                    {!n.isRead && (
                        <span className="inline-flex items-center px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg">New Alert</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
