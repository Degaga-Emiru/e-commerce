'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Users, ShoppingBag, Store, DollarSign, TrendingUp, Package } from 'lucide-react';

interface AdminStats { [key: string]: any }
interface Order { id: number; orderNumber: string; user?: { firstName: string; lastName: string }; status: string; finalAmount: number; orderDate: string; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fx = async () => {
      try {
        const [dashRes, ordersRes, sellersRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/admin/orders').catch(() => ({ data: [] })),
          api.get('/admin/sellers').catch(() => ({ data: [] })),
        ]);
        setStats(dashRes.data.data?.stats || {});
        setOrders((ordersRes.data?.data || ordersRes.data || []).slice(0, 10));
        setSellers(sellersRes.data?.data || sellersRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fx();
  }, []);

  const STATUS_COLORS: Record<string, string> = { PENDING:'#f59e0b', PROCESSING:'#6366f1', SHIPPED:'#06b6d4', DELIVERED:'#10b981', CANCELLED:'#ef4444' };

  const cards = [
    { label: 'Total Users', value: stats['Total Users'] ?? 0, icon: <Users size={22} />, color: '#6366f1' },
    { label: 'Total Sellers', value: stats['Total Sellers'] ?? 0, icon: <Store size={22} />, color: '#8b5cf6' },
    { label: 'Total Orders', value: stats['Total Orders'] ?? 0, icon: <ShoppingBag size={22} />, color: '#06b6d4' },
    { label: 'Platform Revenue', value: `ETB ${(stats['Platform Revenue'] ?? 0).toLocaleString()}`, icon: <DollarSign size={22} />, color: '#10b981' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>⚙️ Admin Dashboard</h1>
        <p style={{ margin: '0 0 2rem', color: '#94a3b8' }}>Full platform control & analytics</p>

        {loading ? <p style={{ color:'#94a3b8', textAlign:'center', marginTop:'3rem' }}>Loading…</p> : (<>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
            {cards.map((c,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'1.5rem', animation:`fadeInUp ${0.3+i*0.1}s ease` }}>
                <div style={{ width:44,height:44,background:`${c.color}22`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:c.color,marginBottom:'1rem' }}>{c.icon}</div>
                <p style={{ margin:0,color:'#94a3b8',fontSize:12 }}>{c.label}</p>
                <p style={{ margin:'0.25rem 0 0',fontSize:'1.5rem',fontWeight:800,color:'#f1f5f9' }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'1.5rem' }}>
            {/* Recent Orders */}
            <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'1.5rem' }}>
              <h3 style={{ margin:'0 0 1.25rem',color:'#f1f5f9',fontWeight:700 }}>Recent Orders</h3>
              <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
                {orders.length === 0 ? <p style={{ color:'#94a3b8',fontSize:14 }}>No orders yet.</p> : orders.map(o => (
                  <div key={o.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:12 }}>
                    <div>
                      <p style={{ margin:0,color:'#f1f5f9',fontWeight:600,fontSize:14 }}>#{o.orderNumber}</p>
                      <p style={{ margin:0,color:'#94a3b8',fontSize:12 }}>{o.user?.firstName} {o.user?.lastName} | {new Date(o.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
                      <span style={{ background:`${STATUS_COLORS[o.status]||'#6b7280'}22`,color:STATUS_COLORS[o.status]||'#6b7280',borderRadius:6,padding:'0.2rem 0.6rem',fontSize:11,fontWeight:700 }}>{o.status}</span>
                      <span style={{ color:'#10b981',fontWeight:700,fontSize:14 }}>ETB {o.finalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sellers */}
            <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'1.5rem' }}>
              <h3 style={{ margin:'0 0 1.25rem',color:'#f1f5f9',fontWeight:700 }}>Sellers</h3>
              <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
                {sellers.length === 0 ? <p style={{ color:'#94a3b8',fontSize:14 }}>No sellers yet.</p> : sellers.slice(0,8).map((s:any,i:number) => (
                  <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.65rem 0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:10 }}>
                    <div>
                      <p style={{ margin:0,color:'#f1f5f9',fontWeight:600,fontSize:14 }}>{s.shopName || s.firstName+' '+s.lastName}</p>
                      <p style={{ margin:0,color:'#94a3b8',fontSize:12 }}>{s.email || s.user?.email}</p>
                    </div>
                    <span style={{ background:s.verified?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:s.verified?'#10b981':'#f59e0b',borderRadius:6,padding:'0.2rem 0.6rem',fontSize:11,fontWeight:700 }}>
                      {s.verified?'Verified':'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
