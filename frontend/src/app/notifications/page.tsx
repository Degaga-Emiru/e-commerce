'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle, Package, CreditCard, MessageSquare, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view notifications</h1>
        <Link href="/login" className="text-orange-500 font-bold hover:underline">Login here</Link>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHIPPING': return <Package className="text-cyan-500" size={20} />;
      case 'PAYMENT': return <CreditCard className="text-emerald-500" size={20} />;
      case 'ORDER_UPDATE': return <Bell className="text-indigo-500" size={20} />;
      case 'REVIEW': return <MessageSquare className="text-orange-500" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-orange-500 font-black text-sm uppercase tracking-widest bg-orange-50 px-6 py-2 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] border border-gray-100 shadow-2xl shadow-orange-500/5 text-center flex flex-col items-center">
            <div className="bg-orange-50 p-8 rounded-full mb-6">
              <Bell size={60} className="text-orange-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-400 font-medium max-w-xs">You don't have any notifications right now. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`group relative bg-white p-6 rounded-[2.5rem] border transition-all flex items-start gap-6 ${
                  n.isRead ? 'border-gray-50 opacity-80' : 'border-orange-100 shadow-xl shadow-orange-500/5 ring-1 ring-orange-100'
                }`}
              >
                <div className={`p-4 rounded-2xl flex-shrink-0 ${n.isRead ? 'bg-gray-50' : 'bg-orange-50'}`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 pr-12">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-black tracking-tight ${n.isRead ? 'text-gray-700' : 'text-gray-900 text-lg'}`}>
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed mb-3">{n.message}</p>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.isRead && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
