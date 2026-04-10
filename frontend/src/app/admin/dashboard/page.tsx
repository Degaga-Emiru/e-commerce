'use client';
import { useEffect, useState, useCallback } from 'react';
import api, { shippingApi } from '@/services/api';
import toast from 'react-hot-toast';
import {
  BarChart2, Users, ShoppingBag, DollarSign, Package, Truck,
  Shield, Bell, Settings, Store, CheckCircle, RefreshCw, 
  Lock, Unlock, TrendingUp, Send, Search, ExternalLink, Tag,
  User, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

// ── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalOrders: number; totalUsers: number; totalSellers: number;
  pendingOrders: number; deliveredOrders: number;
  escrowHeld: number; escrowReleased: number;
  platformEarnings: number; totalRevenue: number;
  ordersByStatus: Record<string, number>;
}
interface Order {
  id: number; orderNumber: string; status: string; finalAmount: number;
  orderDate: string; paymentStatus: string;
  user?: { id: number; firstName: string; lastName: string; email: string };
  orderItems?: { id: number; quantity: number; unitPrice: number; product?: { id: number; name: string } }[];
}
interface Escrow {
  id: number; status: string; totalAmount: number; platformFee: number;
  sellerAmount: number; createdAt: string; releasedAt?: string;
  order?: { id: number; orderNumber: string };
}
interface UserEntry {
  id: number; firstName: string; lastName: string; email: string;
  role: string; enabled: boolean;
}
interface SellerProfile {
  id: number; shopName: string; description: string;
  verified: boolean; logoUrl?: string;
  user?: { id: number; email: string; firstName: string; lastName: string };
}
interface Product {
  id: number; name: string; description: string; price: number;
  stockQuantity: number; category?: { id: number; name: string };
  seller?: { id: number; shopName: string };
}
interface WithdrawalRequest {
  id: number; amount: number; status: string; createdAt: string; processedAt?: string;
  bankAccountSnapshot: string;
  seller?: { id: number; firstName: string; lastName: string; email: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SC: Record<string, string> = {
  PENDING: '#f59e0b', PROCESSING: '#6366f1', SHIPPED: '#06b6d4',
  OUT_FOR_DELIVERY: '#f97316', DELIVERED: '#10b981', CANCELLED: '#ef4444',
  HELD: '#f59e0b', RELEASED: '#10b981', REFUNDED: '#ef4444',
  COMPLETED: '#10b981', REJECTED: '#ef4444',
};
const STEPS = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const TABS = [
  { id: 'overview',      label: 'Overview',       icon: BarChart2  },
  { id: 'orders',        label: 'Orders',          icon: Package },
  { id: 'shipping',      label: 'Shipping',        icon: Truck       },
  { id: 'escrow',        label: 'Escrow',          icon: Shield      },
  { id: 'products',      label: 'Products',        icon: ShoppingBag },
  { id: 'users',         label: 'Users',           icon: Users       },
  { id: 'sellers',       label: 'Sellers',         icon: Store       },
  { id: 'withdrawals',   label: 'Withdrawals',     icon: DollarSign  },
  { id: 'notifications', label: 'Notifications',   icon: Bell        },
  { id: 'settings',      label: 'Settings',        icon: Settings    },
  { id: 'categories',    label: 'Categories',      icon: Tag,        href: '/admin/categories' },
];

// Extract data from any response shape
function extract(res: any, fallback: any = []) {
  if (!res) return fallback;
  const d = res.data;
  if (!d) return fallback;
  if (Array.isArray(d)) return d;
  if (d.data !== undefined) return Array.isArray(d.data) ? d.data : d.data ?? fallback;
  return fallback;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes, escrowRes, usersRes, sellersRes, productsRes, withdrawRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/orders'),
        api.get('/admin/escrow'),
        api.get('/admin/users'),
        api.get('/admin/sellers'),
        api.get('/admin/products'),
        api.get('/seller/withdrawals/admin/all'),
      ]);

      if (dashRes.status === 'fulfilled') {
        const raw = dashRes.value.data;
        setStats(raw?.stats ?? raw?.data?.stats ?? null);
      }
      if (ordersRes.status === 'fulfilled') {
        const raw = extract(ordersRes.value);
        setOrders(Array.isArray(raw) ? raw : []);
      }
      if (escrowRes.status === 'fulfilled') {
        const raw = extract(escrowRes.value);
        setEscrows(Array.isArray(raw) ? raw : []);
      }
      if (usersRes.status === 'fulfilled') {
        const raw = extract(usersRes.value);
        setUsers(Array.isArray(raw) ? raw : []);
      }
      if (sellersRes.status === 'fulfilled') {
        const raw = extract(sellersRes.value);
        setSellers(Array.isArray(raw) ? raw : []);
      }
      if (productsRes.status === 'fulfilled') {
        const raw = extract(productsRes.value);
        setProducts(Array.isArray(raw) ? raw : []);
      }
      if (withdrawRes.status === 'fulfilled') {
        const raw = extract(withdrawRes.value);
        setWithdrawals(Array.isArray(raw) ? raw : []);
      } else {
        console.error('Withdrawals fetch error:', withdrawRes.reason?.response?.data || withdrawRes.reason);
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.find(x => x.id === t)) {
      setTab(t);
    }
  }, [searchParams]);

  const updateShipping = async (orderId: number, status: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    try {
      await shippingApi.updateStatus(orderId, { status, note: `Status updated to ${status} by Admin` });
      toast.success(`Shipping → ${status.replace(/_/g,' ')}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const releaseEscrow = async (orderId: number) => {
    try {
      await api.post(`/admin/escrow/${orderId}/release`);
      toast.success('Escrow released to seller!');
      fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const refundEscrow = async (orderId: number) => {
    if (!confirm('Refund this escrow to customer?')) return;
    try {
      await api.post(`/admin/escrow/${orderId}/refund`);
      toast.success('Refunded!');
      fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const verifySeller = async (profileId: number, verified: boolean) => {
    try {
      await api.post(`/admin/sellers/${profileId}/verify`, { verified });
      toast.success(verified ? 'Seller verified!' : 'Unverified');
      setSellers(prev => prev.map(s => s.id === profileId ? { ...s, verified } : s));
    } catch (e: any) { toast.error('Failed'); }
  };

  const sendNotif = async () => {
    if (!notifSubject || !notifMsg) return toast.error('Fill subject & message');
    try {
      await api.post('/admin/notifications', { subject: notifSubject, message: notifMsg, color: '#6366f1' });
      toast.success('Announcement sent!');
      setNotifSubject(''); setNotifMsg('');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const res = await api.post(`/admin/users/${userId}/toggle-status`);
      toast.success(res.data.data ? 'User enabled' : 'User disabled');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: res.data.data } : u));
    } catch (e: any) { toast.error('Failed to update status'); }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('Permanently delete this order and all related records?')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      toast.success('Order deleted');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (e: any) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };

  const deleteEscrow = async (id: number) => {
    if (!confirm('Delete this escrow record?')) return;
    try {
      await api.delete(`/admin/escrow/${id}`);
      toast.success('Escrow record deleted');
      setEscrows(prev => prev.filter(e => e.id !== id));
    } catch (e: any) { toast.error('Delete failed'); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product removed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { toast.error('Delete failed'); }
  };

  const syncDB = async () => {
    const loader = toast.loading('Syncing database constraints...');
    try {
      await api.post('/admin/db-sync');
      toast.success('Database constraints synced!', { id: loader });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Sync failed', { id: loader });
    }
  };

  const approveWithdrawal = async (id: number) => {
    const loader = toast.loading('Approving withdrawal and releasing funds...');
    try {
      await api.post(`/seller/withdrawals/admin/${id}/approve`);
      toast.success('Withdrawal approved! Funds have been released to the seller wallet.', { id: loader });
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Approval failed', { id: loader });
    }
  };

  const rejectWithdrawal = async (id: number) => {
    if (!confirm('Reject this withdrawal request?')) return;
    const loader = toast.loading('Rejecting request...');
    try {
      await api.post(`/seller/withdrawals/admin/${id}/reject`);
      toast.success('Withdrawal request rejected.', { id: loader });
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Rejection failed', { id: loader });
    }
  };

  // filtered
  const filteredOrders = orders.filter(o => {
    const ms = statusFilter === 'ALL' || o.status === statusFilter;
    const q = search.toLowerCase();
    const mq = !q || o.orderNumber?.toLowerCase().includes(q)
      || o.user?.email?.toLowerCase().includes(q)
      || `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(q);
    return ms && mq;
  });

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    wrap: { minHeight: '100vh', background: '#080d1a', display: 'flex', fontFamily: "'Inter',sans-serif" } as React.CSSProperties,
    sidebar: { width: 230, background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.065)', padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 } as React.CSSProperties,
    main: { flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: '100vh' } as React.CSSProperties,
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' } as React.CSSProperties,
    inp: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 1rem', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' } as React.CSSProperties,
  };
  const btn = (color: string, outline = false): React.CSSProperties => ({
    background: outline ? 'transparent' : color, color: outline ? color : '#fff',
    border: `1px solid ${color}`, borderRadius: 9, padding: '0.45rem 1.1rem',
    cursor: 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.15s',
  });
  const badge = (s: string): React.CSSProperties => ({
    background: `${SC[s]||'#6b7280'}22`, color: SC[s]||'#94a3b8',
    border: `1px solid ${SC[s]||'#6b7280'}44`,
    borderRadius: 8, padding: '0.2rem 0.65rem', fontSize: 11, fontWeight: 700,
  });

  const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ margin: '0.3rem 0 0', fontSize: 11, color: '#475569' }}>{sub}</p>}
        </div>
        <div style={{ background: `${color}1a`, borderRadius: 12, padding: '0.75rem', color }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────
  // ── Tabs (Render Functions) ────────────────────────────────────────────────
  const renderOverviewTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>📊 Platform Overview</h2>
        <button onClick={fetchAll} style={{ ...btn('#6366f1', true), display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Revenue" value={`ETB ${Number(stats?.totalRevenue||0).toLocaleString()}`} icon={DollarSign} color="#10b981" sub="Gross all-time" />
        <StatCard label="Platform Earnings" value={`ETB ${Number(stats?.platformEarnings||0).toLocaleString()}`} icon={TrendingUp} color="#6366f1" sub="10% commission" />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? orders.length} icon={ShoppingBag} color="#06b6d4" sub={`${stats?.pendingOrders??0} pending`} />
        <StatCard label="Customers" value={stats?.totalUsers ?? users.filter(u=>u.role==='CUSTOMER').length} icon={Users} color="#8b5cf6" />
        <StatCard label="Sellers" value={stats?.totalSellers ?? sellers.length} icon={Store} color="#f59e0b" />
        <StatCard label="Escrow Held" value={`ETB ${Number(stats?.escrowHeld||0).toLocaleString()}`} icon={Lock} color="#f97316" />
        <StatCard label="Escrow Released" value={`ETB ${Number(stats?.escrowReleased||0).toLocaleString()}`} icon={Unlock} color="#10b981" />
        <StatCard label="Delivered" value={stats?.deliveredOrders ?? 0} icon={CheckCircle} color="#10b981" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={S.card}>
          <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Category Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 120, paddingBottom: 20 }}>
            {['Shoes','Electronics','Fashion','Beauty','Home'].map(c => {
               const val = Math.floor(Math.random() * 80) + 20;
               return (
                 <div key={c} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                   <div style={{ width: '100%', height: `${val}%`, background: 'linear-gradient(to top, #6366f1, #8b5cf6)', borderRadius: '4px 4px 0 0' }} title={`${c}: ${val}%`} />
                   <span style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }}>{c}</span>
                 </div>
               )
            })}
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Revenue Growth</h3>
          <div style={{ position: 'relative', height: 120 }}>
             <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
               <path d="M0 80 Q 50 70, 100 85 T 200 60 T 300 40 T 400 20" fill="none" stroke="#10b981" strokeWidth="3" />
               <path d="M0 80 Q 50 70, 100 85 T 200 60 T 300 40 T 400 20 L 400 100 L 0 100 Z" fill="url(#grad)" opacity="0.2" />
               <defs>
                 <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                   <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                 </linearGradient>
               </defs>
             </svg>
             <div style={{ position: 'absolute', bottom: -5, width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569' }}>
               <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
             </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem' }}>
        {/* Status donut-like chart */}
        <div style={S.card}>
          <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Orders by Status</h3>
          {stats?.ordersByStatus
            ? Object.entries(stats.ordersByStatus).map(([s, n]) => {
                const pct = Math.round((n / (stats.totalOrders || 1)) * 100);
                return (
                  <div key={s} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: SC[s]||'#94a3b8', fontWeight: 700, fontSize: 12 }}>{s}</span>
                      <span style={{ color: '#64748b', fontSize: 12 }}>{n} ({pct}%)</span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: SC[s]||'#6366f1', borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })
            : <p style={{ color: '#475569', fontSize: 13 }}>Loading...</p>
          }
        </div>
        {/* Recent orders */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Recent Orders</h3>
            <button onClick={() => setTab('orders')} style={btn('#6366f1', true)}>View All →</button>
          </div>
          {orders.length === 0
            ? <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '1.5rem' }}>No orders yet.</p>
            : orders.slice(0, 8).map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>#{o.orderNumber}</p>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: '#fff', background: '#6366f1', padding: '0.2rem 0.5rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, textDecoration: 'none', fontWeight: 600 }}>
                      View Details <ExternalLink size={10} />
                    </Link>
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: 11 }}>{o.user?.firstName} {o.user?.lastName}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={badge(o.status)}>{o.status}</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>ETB {o.finalAmount?.toLocaleString()}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>📦 All Orders ({filteredOrders.length})</h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input style={{ ...S.inp, paddingLeft: 34 }} placeholder="Search order # or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ ...S.inp, width: 'auto', minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {['PENDING','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={S.card}>
        {filteredOrders.length === 0
          ? <p style={{ color: '#475569', textAlign: 'center', padding: '3rem', fontSize: 14 }}>No orders match your filters.</p>
          : filteredOrders.map(o => (
            <div key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>#{o.orderNumber}</p>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: '#fff', background: '#6366f1', padding: '0.2rem 0.6rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                      View Details <ExternalLink size={10} />
                    </Link>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: 12 }}>
                    {o.user?.firstName} {o.user?.lastName} · {o.user?.email}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', color: '#475569', fontSize: 11 }}>
                    {new Date(o.orderDate).toLocaleString()} · {o.orderItems?.length ?? 0} item(s)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={badge(o.status)}>{o.status}</span>
                  <span style={badge(o.paymentStatus || 'PENDING')}>{o.paymentStatus || 'PENDING'}</span>
                  <span style={{ color: '#10b981', fontWeight: 800, fontSize: 15 }}>ETB {o.finalAmount?.toLocaleString()}</span>
                </div>
              </div>
              {/* Items summary */}
              {o.orderItems && o.orderItems.length > 0 && (
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {o.orderItems.map((item, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.2rem 0.6rem', fontSize: 11, color: '#94a3b8' }}>
                      {item.product?.name || 'Product'} ×{item.quantity}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => deleteOrder(o.id)} style={{ ...btn('#ef4444', true), padding: '0.3rem 0.6rem', fontSize: 10 }}>
                  🗑 Delete Order
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  const renderShippingTab = () => {
    const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
    return (
      <div>
        <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>🚚 Shipping Management ({active.length} active)</h2>
        {active.length === 0
          ? <div style={{ ...S.card, textAlign: 'center', padding: '4rem' }}>
              <Truck size={48} style={{ color: '#6366f1', opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: '#475569', margin: 0 }}>No active shipments. All orders delivered or no orders placed yet.</p>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {active.map(o => {
                const stepIdx = STEPS.indexOf(o.status);
                return (
                  <div key={o.id} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Order #{o.orderNumber}</p>
                          <Link href={`/admin/orders/${o.id}`} style={{ color: '#fff', background: '#6366f1', padding: '0.25rem 0.6rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                            View Details <ExternalLink size={10} />
                          </Link>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: 12 }}>
                          {o.user?.firstName} {o.user?.lastName} · {new Date(o.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={badge(o.status)}>{o.status}</span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>ETB {o.finalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: 4 }}>
                      {STEPS.map((step, i) => {
                        const done = i <= stepIdx;
                        const current = i === stepIdx;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: o.status === 'CANCELLED' ? '#ef4444' : done ? '#10b981' : 'rgba(255,255,255,0.08)',
                                border: (current && o.status !== 'CANCELLED') ? '2px solid #10b981' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800,
                                color: (done || o.status === 'CANCELLED') ? '#fff' : '#475569',
                              }}>
                                {o.status === 'CANCELLED' ? '✘' : done ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: 9, color: done ? '#10b981' : '#475569', whiteSpace: 'nowrap', fontWeight: done ? 700 : 400, textAlign: 'center', maxWidth: 70 }}>
                                {step.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div style={{ width: 40, height: 2, background: o.status === 'CANCELLED' ? '#ef4444' : i < stepIdx ? '#10b981' : 'rgba(255,255,255,0.08)', margin: '0 4px 18px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {o.status === 'CANCELLED' ? (
                        <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 18 }}>✘</span> Order is Cancelled. No further shipping actions available.
                        </div>
                      ) : (
                        <>
                          {STEPS.map((s, idx) => {
                            const isNextStep = idx === stepIdx + 1;
                            const isCurrent = o.status === s;
                            const isPast = stepIdx > idx;
                            const isDisabled = !isNextStep || updatingOrderId === o.id;

                            return (
                              <button key={s} onClick={() => updateShipping(o.id, s)}
                                disabled={isDisabled}
                                style={{ 
                                  ...btn(SC[s] || '#6366f1', isDisabled), 
                                  opacity: isDisabled ? 0.4 : 1, 
                                  padding: '0.4rem 0.9rem', fontSize: 11,
                                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                                }}>
                                {updatingOrderId === o.id && isNextStep ? '...' : s.replace(/_/g, ' ')}
                              </button>
                            );
                          })}
                          {(!['OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)) && (
                            <button onClick={() => updateShipping(o.id, 'CANCELLED')}
                              disabled={updatingOrderId === o.id}
                              style={{ ...btn('#ef4444', true), padding: '0.4rem 0.9rem', fontSize: 11, opacity: updatingOrderId === o.id ? 0.5 : 1 }}>
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    );
  };

  const renderEscrowTab = () => (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>💰 Escrow & Payments</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Held" value={`ETB ${Number(stats?.escrowHeld||0).toLocaleString()}`} icon={Lock} color="#f59e0b" />
        <StatCard label="Released" value={`ETB ${Number(stats?.escrowReleased||0).toLocaleString()}`} icon={Unlock} color="#10b981" />
        <StatCard label="Platform Cut" value={`ETB ${Number(stats?.platformEarnings||0).toLocaleString()}`} icon={TrendingUp} color="#6366f1" />
      </div>
      <div style={S.card}>
        <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>All Escrow Records</h3>
        {escrows.length === 0
          ? <p style={{ color: '#475569', textAlign: 'center', padding: '2rem', fontSize: 13 }}>No escrow records yet.</p>
          : escrows.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>Order #{e.order?.orderNumber || e.id}</p>
                <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: 12 }}>
                  Total: ETB {Number(e.totalAmount||0).toLocaleString()} · 
                  Fee: ETB {Number(e.platformFee||0).toLocaleString()} (10%) · 
                  Seller: ETB {Number(e.sellerAmount||0).toLocaleString()}
                </p>
                <p style={{ margin: '0.2rem 0 0', color: '#475569', fontSize: 11 }}>
                  Created: {new Date(e.createdAt).toLocaleDateString()}
                  {e.releasedAt && ` · Released: ${new Date(e.releasedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={badge(e.status)}>{e.status}</span>
                {e.status === 'HELD' && e.order && (
                  <>
                    <button onClick={() => releaseEscrow(e.order!.id)} style={btn('#10b981', true)}>✓ Release</button>
                    <button onClick={() => refundEscrow(e.order!.id)} style={btn('#ef4444', true)}>↩ Refund</button>
                  </>
                )}
                <button onClick={() => deleteEscrow(e.id)} style={{ ...btn('#475569', true), padding: '0.25rem 0.5rem' }} title="Delete Record">
                  🗑
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  const renderUsersTab = () => {
    const f = users.filter(u => !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
    return (
      <div>
        <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>👥 User Management ({users.length})</h2>
        <input style={{ ...S.inp, marginBottom: '1rem' }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={S.card}>
          {f.length === 0
            ? <p style={{ color: '#475569', textAlign: 'center', padding: '2rem' }}>No users found.</p>
            : f.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                    {u.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{u.firstName} {u.lastName}</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>{u.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: u.role==='ADMIN'?'rgba(99,102,241,0.2)':u.role==='SELLER'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)', color: u.role==='ADMIN'?'#a5b4fc':u.role==='SELLER'?'#fbbf24':'#6ee7b7', borderRadius: 8, padding: '0.2rem 0.65rem', fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: u.enabled ? '#10b981' : '#f59e0b', fontSize: 11, fontWeight: 700 }}>
                        {u.enabled ? '● Active' : '○ Disabled'}
                      </span>
                      <button 
                        onClick={() => toggleUserStatus(u.id)} 
                        title={u.enabled ? 'Click to disable' : 'Click to enable'}
                        style={{ ...btn(u.enabled ? '#f59e0b' : '#10b981', true), padding: '0.25rem 0.6rem' }}
                      >
                        {u.enabled ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                    <span style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>
                      {u.enabled ? 'Revoke account access' : 'Grant account access'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  const renderSellersTab = () => (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>🏪 Seller Management ({sellers.length})</h2>
      {sellers.length === 0
        ? <div style={{ ...S.card, textAlign: 'center', padding: '3rem', color: '#475569' }}>No seller profiles yet.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sellers.map(s => (
              <div key={s.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {s.logoUrl ? <img src={s.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : '🏪'}
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: 15 }}>{s.shopName || 'Unnamed Shop'}</p>
                      <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: 12 }}>{s.user?.email}</p>
                      {s.description && <p style={{ margin: '0.25rem 0 0', color: '#475569', fontSize: 12 }}>{s.description}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: s.verified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: s.verified ? '#10b981' : '#f59e0b', borderRadius: 8, padding: '0.3rem 0.8rem', fontSize: 12, fontWeight: 700 }}>
                       {s.verified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                    <button onClick={() => verifySeller(s.id, !s.verified)} style={btn(s.verified ? '#ef4444' : '#10b981', true)}>
                      {s.verified ? 'Unverify' : 'Verify ✓'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );

  const renderNotifTab = () => (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>🔔 Notification Center</h2>
      <div style={S.card}>
        <h3 style={{ margin: '0 0 1.25rem', color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>📢 Send Announcement to All Users (Email)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Subject</label>
            <input style={S.inp} placeholder="e.g. Site Maintenance Scheduled" value={notifSubject} onChange={e => setNotifSubject(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Message</label>
            <textarea style={{ ...S.inp, minHeight: 110, resize: 'vertical' }} placeholder="Your message to all users..." value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
          </div>
          <button onClick={sendNotif} style={{ ...btn('#6366f1'), alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.5rem' }}>
            <Send size={15} /> Send to All Users
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductsTab = () => {
    const f = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.seller?.shopName?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div>
        <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>📦 Product Inventory ({products.length})</h2>
        <input style={{ ...S.inp, marginBottom: '1rem' }} placeholder="Search products or sellers..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={S.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f1f5f9' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Seller</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {f.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>No products found.</td></tr>
              ) : f.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>ID: {p.id}</p>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: 11, fontWeight: 600 }}>
                      {p.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ color: p.stockQuantity < 5 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#10b981' }}>ETB {p.price.toLocaleString()}</td>
                  <td style={{ padding: '1rem 0.5rem', fontSize: 13, color: '#94a3b8' }}>{p.seller?.shopName || 'Unknown'}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <button onClick={() => deleteProduct(p.id)} style={{ ...btn('#ef4444', true), padding: '0.35rem' }} title="Delete Product">
                      <RefreshCw size={14} style={{ color: '#ef4444', transform: 'rotate(45deg)' }} /> 
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>⚙️ System Settings</h2>
        <button onClick={syncDB} style={{ ...btn('#10b981', true), display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Sync Database Constraints
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
        {[
          { icon: '💰', title: 'Commission Rate', val: '10%', color: '#10b981', desc: 'Platform fee deducted before releasing escrow to sellers.' },
          { icon: '💳', title: 'Payment Gateway', val: 'Chapa', color: '#6366f1', desc: 'All ETB payments processed securely via Chapa API.' },
          { icon: '🔒', title: 'Escrow Policy', val: 'Auto on DELIVERED', color: '#f59e0b', desc: 'Funds release automatically when order status = DELIVERED.' },
          { icon: '📧', title: 'Email Service', val: 'SMTP Enabled', color: '#06b6d4', desc: 'Sends transactional emails for orders, shipping, and escrow.' },
        ].map(item => (
          <div key={item.title} style={S.card}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{item.title}</h3>
                  <span style={{ background: `${item.color}22`, color: item.color, borderRadius: 6, padding: '0.1rem 0.55rem', fontSize: 11, fontWeight: 800 }}>{item.val}</span>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWithdrawalsTab = () => (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem' }}>🧾 Withdrawal Management</h2>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f1f5f9' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Seller</th>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>No withdrawal requests found.</td></tr>
            ) : withdrawals.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0.5rem', fontSize: 13, color: '#94a3b8' }}>#{w.id}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{w.seller?.firstName} {w.seller?.lastName}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{w.seller?.email}</p>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 800, color: '#10b981' }}>ETB {w.amount.toLocaleString()}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={badge(w.status)}>{w.status}</span>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: 12, color: '#475569' }}>
                   {new Date(w.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {w.status === 'PENDING' ? (
                      <>
                        <button onClick={() => approveWithdrawal(w.id)} style={{ ...btn('#10b981'), padding: '0.4rem 0.8rem' }}>Approve</button>
                        <button onClick={() => rejectWithdrawal(w.id)} style={{ ...btn('#ef4444', true), padding: '0.4rem 0.8rem' }}>Reject</button>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>Processed</span>
                    )}
                    <button onClick={() => alert(w.bankAccountSnapshot)} style={{ ...btn('#6366f1', true), padding: '0.4rem 0.8rem' }}>Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case 'overview': return renderOverviewTab();
      case 'orders': return renderOrdersTab();
      case 'shipping': return renderShippingTab();
      case 'escrow': return renderEscrowTab();
      case 'users': return renderUsersTab();
      case 'sellers': return renderSellersTab();
      case 'products': return renderProductsTab();
      case 'notifications': return renderNotifTab();
      case 'settings': return renderSettingsTab();
      case 'withdrawals': return renderWithdrawalsTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <div style={S.wrap}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1e293b; color: #f1f5f9; }
      `}</style>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ padding: '0 0.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
          <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 900, fontSize: 17 }}>⚙️ Admin Panel</p>
          <p style={{ margin: '0.2rem 0 0', color: '#475569', fontSize: 11 }}>Platform Control Center</p>
        </div>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          const content = (
            <>
              <Icon size={17} />
              {t.label}
              {t.id === 'orders' && (stats?.pendingOrders ?? 0) > 0 && (
                <span style={{ marginLeft: 'auto', background: '#f97316', color: '#fff', borderRadius: 20, padding: '0.1rem 0.45rem', fontSize: 10, fontWeight: 900 }}>
                  {stats?.pendingOrders}
                </span>
              )}
            </>
          );
          
          const tabStyle: React.CSSProperties = {
            display: 'flex', alignItems: 'center', gap: 9, padding: '0.7rem 0.875rem',
            borderRadius: 11, cursor: 'pointer', fontSize: 13, textAlign: 'left',
            background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
            border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            color: active ? '#a5b4fc' : '#94a3b8', fontWeight: active ? 700 : 500,
            transition: 'all 0.15s', width: '100%', textDecoration: 'none', boxSizing: 'border-box'
          };

          if ((t as any).href) {
            return (
              <Link key={t.id} href={(t as any).href} style={tabStyle}>
                {content}
              </Link>
            );
          }

          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setStatusFilter('ALL'); }} style={tabStyle}>
              {content}
            </button>
          );
        })}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0.5rem 0.875rem', width: '100%', textAlign: 'left' }}>
            <RefreshCw size={13} /> Refresh All Data
          </button>
          
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '0.7rem 0.875rem', width: '100%', textDecoration: 'none' }}>
            <User size={15} /> My Profile
          </Link>

          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: '0.7rem 0.875rem', width: '100%', borderRadius: 10, marginTop: 4 }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={S.main}>
        {loading
          ? (
            <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: '#475569', fontSize: 14 }}>Loading platform data...</p>
            </div>
          )
          : renderContent()
        }
      </div>
    </div>
  );
}
