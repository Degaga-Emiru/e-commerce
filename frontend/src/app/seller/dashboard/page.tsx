'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  AlertTriangle, 
  Info,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  Store
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SellerStats {
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
  totalOrders: number;
  availableBalance: number;
  escrowBalance: number;
}

interface TrendData {
  date: string;
  sales: number;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, trendsRes] = await Promise.all([
          api.get('/seller/profile'),
          api.get('/seller/dashboard/summary'),
          api.get('/seller/dashboard/trends')
        ]);
        
        setProfile(profileRes.data);
        setStats(statsRes.data?.data || statsRes.data);
        setTrends(trendsRes.data?.data || trendsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const cards = [
    { label: 'Total Revenue', value: stats?.totalRevenue || 0, icon: <DollarSign size={20} />, color: '#10b981', prefix: 'ETB ' },
    { label: 'Available Balance', value: stats?.availableBalance || 0, icon: <Wallet size={20} />, color: '#6366f1', prefix: 'ETB ', sub: 'Ready to withdraw' },
    { label: 'Escrow Balance', value: stats?.escrowBalance || 0, icon: <ShieldCheck size={20} />, color: '#f59e0b', prefix: 'ETB ', sub: 'Held until delivery' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: <ShoppingBag size={20} />, color: '#ec4899', sub: 'Action required' },
  ];

  // Helper for SVG Chart
  const renderChart = () => {
    if (trends.length < 2) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Not enough data for sales trend</div>;

    const maxSales = Math.max(...trends.map(t => t.sales), 1);
    const width = 800;
    const height = 200;
    const padding = 20;
    
    const points = trends.map((t, i) => {
      const x = (i / (trends.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((t.sales / maxSales) * (height - padding * 2) + padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minHeight: 200 }}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={`M ${padding},${height} ${points.split(' ').map((p, i) => i === 0 ? 'L ' + p : 'L ' + p).join(' ')} L ${width-padding},${height} Z`} fill="url(#grad)" />
          <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {trends.map((t, i) => {
             const x = (i / (trends.length - 1)) * (width - padding * 2) + padding;
             const y = height - ((t.sales / maxSales) * (height - padding * 2) + padding);
             return (
               <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#6366f1" />
                {i % 5 === 0 && <text x={x} y={height - 5} fontSize="10" fill="#64748b" textAnchor="middle">{t.date.split('-').slice(1).join('/')}</text>}
               </g>
             );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.025em' }}>
            Welcome Back, {user?.firstName} 👋
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Here is what's happening with your shop today.
          </p>
        </motion.div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/seller/products" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(255, 255, 255, 0.05)', 
            color: '#cbd5e1', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s'
          }}>
            <Package size={18} /> Manage Inventory
          </Link>
          <Link href="/seller/products" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
            color: '#fff', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}>
            <PlusCircle size={18} /> Add New Product
          </Link>
        </div>
      </div>

      {/* Warning if profile incomplete */}
      {!profile?.shopName && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.2)', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            marginBottom: '2.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem' 
          }}
        >
          <div style={{ background: '#f59e0b', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
            <AlertTriangle size={20} color="#fff" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#fbbf24', fontWeight: 700 }}>Action Required: Profile Incomplete</h4>
            <p style={{ margin: '0.25rem 0 0', color: '#f59e0b', fontSize: '0.9rem' }}>
              Your shop is not yet active. Please complete your <Link href="/seller/settings" style={{ fontWeight: 700, textDecoration: 'underline' }}>Store Settings</Link> to start selling.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '24px', 
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: `${card.color}15`, 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: card.color,
              marginBottom: '1.25rem'
            }}>
              {card.icon}
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{card.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
                {card.prefix}{card.value.toLocaleString()}
              </h2>
            </div>
            {card.sub && <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> {card.sub}
            </p>}
            
            {/* Subtle background decoration */}
            <div style={{ 
              position: 'absolute', 
              right: '-10px', 
              bottom: '-10px', 
              opacity: 0.05, 
              transform: 'rotate(-15deg)',
              color: card.color
            }}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Secondary Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Sales Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '24px', 
            padding: '2rem' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>Revenue Overview</h3>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Last 30 days performance</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
              <ArrowUpRight size={16} /> +12.5% from last month
            </div>
          </div>
          
          <div style={{ height: '220px', width: '100%' }}>
            {renderChart()}
          </div>
        </motion.div>

        {/* Quick Actions / Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '24px', 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <h3 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Request Withdrawal', icon: <Wallet size={18} />, path: '/seller/withdrawals', color: '#6366f1' },
              { label: 'Update Shop Profile', icon: <Store size={18} />, path: '/seller/settings', color: '#94a3b8' },
              { label: 'View All Orders', icon: <ShoppingBag size={18} />, path: '/seller/orders', color: '#94a3b8' },
            ].map((action, i) => (
              <Link key={i} href={action.path} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f1f5f9',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
                <div style={{ color: action.color }}>{action.icon}</div>
                {action.label}
              </Link>
            ))}
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#a5b4fc', lineHeight: 1.5 }}>
                Need help? Visit our <Link href="#" style={{ textDecoration: 'underline' }}>Seller Support</Link> or contact our payment team.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
