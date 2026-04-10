'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  Shield, Users, ShoppingBag, DollarSign, Store, Package,
  ArrowRight, BarChart2, Truck, Bell, Settings, Tag,
  Wallet, Lock, TrendingUp
} from 'lucide-react';

interface PlatformStats {
  totalOrders: number;
  totalUsers: number;
  totalSellers: number;
  pendingOrders: number;
  deliveredOrders: number;
  escrowHeld: number;
  escrowReleased: number;
  platformEarnings: number;
  totalRevenue: number;
}

const AdminProfileSection: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        const raw = res.data;
        setStats(raw?.stats ?? raw?.data?.stats ?? null);
      } catch (e) {
        console.error('Failed to fetch admin stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `ETB ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#10b981', bg: 'bg-emerald-50' },
    { label: 'Platform Earnings', value: `ETB ${(stats?.platformEarnings || 0).toLocaleString()}`, icon: TrendingUp, color: '#6366f1', bg: 'bg-indigo-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: '#06b6d4', bg: 'bg-cyan-50' },
    { label: 'Customers', value: stats?.totalUsers || 0, icon: Users, color: '#8b5cf6', bg: 'bg-violet-50' },
    { label: 'Sellers', value: stats?.totalSellers || 0, icon: Store, color: '#f59e0b', bg: 'bg-amber-50' },
    { label: 'Escrow Held', value: `ETB ${(stats?.escrowHeld || 0).toLocaleString()}`, icon: Lock, color: '#f97316', bg: 'bg-orange-50' },
  ];

  const quickLinks = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: BarChart2, desc: 'Full platform control center', primary: true },
    { label: 'Manage Orders', href: '/admin/dashboard', icon: Package, desc: 'View and process all orders' },
    { label: 'Manage Users', href: '/admin/dashboard', icon: Users, desc: 'Enable/disable user accounts' },
    { label: 'Manage Sellers', href: '/admin/dashboard', icon: Store, desc: 'Verify and manage sellers' },
    { label: 'Escrow & Payments', href: '/admin/dashboard', icon: Wallet, desc: 'Release or refund escrow' },
    { label: 'Shipping', href: '/admin/dashboard', icon: Truck, desc: 'Update order shipping status' },
    { label: 'Categories', href: '/admin/categories', icon: Tag, desc: 'Manage product categories' },
    { label: 'Notifications', href: '/admin/dashboard', icon: Bell, desc: 'Send announcements' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Admin Identity Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-[2rem] p-8 text-white shadow-xl shadow-gray-900/30">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <Shield size={36} className="text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black tracking-tight">Admin Control Panel</h2>
              <span className="flex items-center gap-1 bg-indigo-400/20 text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/30">
                <Shield size={12} /> Super Admin
              </span>
            </div>
            <p className="text-white/50 text-sm font-medium max-w-lg">
              Full platform management — orders, users, sellers, escrow, and more.
            </p>
          </div>

          <Link 
            href="/admin/dashboard"
            className="shrink-0 bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Open Dashboard <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mini stats row inside the banner */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: `ETB ${(stats?.totalRevenue || 0).toLocaleString()}` },
            { label: 'Orders', value: stats?.totalOrders || 0 },
            { label: 'Pending', value: stats?.pendingOrders || 0 },
            { label: 'Delivered', value: stats?.deliveredOrders || 0 },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xl font-black text-white">{item.value}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Management Actions */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-6">Platform Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex flex-col items-center text-center gap-3 p-6 rounded-2xl border transition-all group ${
                  link.primary 
                    ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/80' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  link.primary ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <Icon size={24} className={link.primary ? 'text-indigo-600' : 'text-gray-500'} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${link.primary ? 'text-indigo-700' : 'text-gray-900'}`}>{link.label}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSection;
