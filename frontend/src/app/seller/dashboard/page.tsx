'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Link from 'next/link';
import { Package, ShoppingBag, TrendingUp, DollarSign, PlusCircle, AlertTriangle, Store } from 'lucide-react';

interface SellerStats {
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
  totalOrders: number;
}

interface SellerProfile {
  shopName: string;
  description: string;
  verified: boolean;
  hasProfile: boolean;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fx = async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([
          api.get('/seller/profile'),
          api.get('/dashboard/summary'),
        ]);
        setProfile(profileRes.data);
        const d = dashRes.data.data?.stats || {};
        setStats({
          totalProducts: d['Total Products'] || 0,
          pendingOrders: d['Pending Orders'] || 0,
          totalRevenue: d['Total Revenue'] || 0,
          totalOrders: d['Total Orders'] || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fx();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: <Package size={24} />, color: '#6366f1', link: '/seller/products' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: <ShoppingBag size={24} />, color: '#f59e0b', link: '/seller/orders' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <TrendingUp size={24} />, color: '#10b981', link: '/seller/orders' },
    { label: 'Revenue (ETB)', value: `${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign size={24} />, color: '#06b6d4', link: '#' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              🏪 {profile?.shopName || 'Seller Portal'}
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0' }}>
              Welcome back, {user?.firstName}! {profile?.verified ? '✅ Verified' : '⏳ Pending Verification'}
            </p>
          </div>
          <Link href="/seller/products" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>
            <PlusCircle size={18} /> Add Product
          </Link>
        </div>

        {/* Profile setup prompt */}
        {!profile?.shopName && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeInUp 0.6s ease' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={{ color: '#fbbf24' }}>Complete your <Link href="/seller/profile" style={{ color: '#fbbf24', fontWeight: 700 }}>shop profile</Link> to start selling.</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {cards.map((c, i) => (
            <Link key={i} href={c.link} style={{ textDecoration: 'none', display: 'block', animation: `fadeInUp ${0.3 + i * 0.1}s ease` }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${c.color}33`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ width: 48, height: 48, background: `${c.color}22`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, marginBottom: '1rem' }}>
                  {c.icon}
                </div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{c.label}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>{c.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/seller/products', icon: <Package size={20} />, label: 'Manage Products' },
            { href: '/seller/orders', icon: <ShoppingBag size={20} />, label: 'View Orders' },
            { href: '/seller/profile', icon: <Store size={20} />, label: 'Shop Settings' },
          ].map((l, i) => (
            <Link key={i} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
