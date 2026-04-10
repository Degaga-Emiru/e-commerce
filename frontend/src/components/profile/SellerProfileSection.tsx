'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  Store, Package, ShoppingBag, Wallet, TrendingUp,
  CheckCircle, AlertCircle, ArrowRight, DollarSign,
  ShieldCheck, BarChart2, Settings
} from 'lucide-react';

interface ShopData {
  shopName: string;
  description: string;
  logoUrl: string;
  verified: boolean;
}

interface SellerStats {
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
  totalOrders: number;
  availableBalance: number;
  escrowBalance: number;
}

const SellerProfileSection: React.FC = () => {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.allSettled([
          api.get('/seller/profile'),
          api.get('/seller/dashboard/summary'),
        ]);
        if (profileRes.status === 'fulfilled') setShop(profileRes.value.data);
        if (statsRes.status === 'fulfilled') {
          const d = statsRes.value.data;
          setStats(d?.data || d);
        }
      } catch (e) {
        console.error('Failed to fetch seller data:', e);
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
    { label: 'Available Balance', value: `ETB ${(stats?.availableBalance || 0).toLocaleString()}`, icon: Wallet, color: '#6366f1', bg: 'bg-indigo-50' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: '#f59e0b', bg: 'bg-amber-50' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: ShoppingBag, color: '#ec4899', bg: 'bg-pink-50' },
  ];

  const quickLinks = [
    { label: 'Seller Dashboard', href: '/seller/dashboard', icon: BarChart2, desc: 'View full analytics & reports' },
    { label: 'Manage Products', href: '/seller/products', icon: Package, desc: 'Add, edit, or remove listings' },
    { label: 'View Orders', href: '/seller/orders', icon: ShoppingBag, desc: 'Track and fulfill orders' },
    { label: 'Withdrawals', href: '/seller/withdrawals', icon: Wallet, desc: 'Request fund withdrawals' },
    { label: 'Shop Settings', href: '/seller/settings', icon: Settings, desc: 'Update shop profile & details' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Shop Identity Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
            {shop?.logoUrl ? (
              <img src={shop.logoUrl} alt="Shop" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Store size={36} className="text-white/80" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black tracking-tight">{shop?.shopName || 'My Shop'}</h2>
              {shop?.verified ? (
                <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/30">
                  <CheckCircle size={12} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-amber-400/20 text-amber-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-400/30">
                  <AlertCircle size={12} /> Pending
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm font-medium max-w-lg">{shop?.description || 'Complete your shop profile to start selling.'}</p>
          </div>

          <Link 
            href="/seller/dashboard"
            className="shrink-0 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Quick Actions */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-6">Seller Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
                  <Icon size={20} className="text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{link.label}</p>
                  <p className="text-xs text-gray-400 font-medium">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-200 group-hover:text-indigo-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileSection;
