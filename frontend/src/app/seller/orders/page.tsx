'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Truck, CheckCircle, Clock } from 'lucide-react';

interface Order { id: number; orderNumber: string; user: { firstName: string; lastName: string; email: string }; status: string; finalAmount: number; orderDate: string; orderItems: any[]; }

const STATUS_OPTIONS = ['PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED'];
const STATUS_COLORS: Record<string, string> = { PENDING:'#f59e0b', PROCESSING:'#6366f1', SHIPPED:'#06b6d4', OUT_FOR_DELIVERY:'#f97316', DELIVERED:'#10b981' };

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/orders').then(r => setOrders(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateShipping = async (orderId: number, status: string) => {
    try {
      await api.put(`/seller/orders/${orderId}/shipping`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Status updated to ${status}`);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 2rem', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>📦 My Orders</h1>

        {loading ? <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '3rem' }}>Loading orders…</p>
          : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <ShoppingBag size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 16 }}>Order #{order.orderNumber}</p>
                      <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: 13 }}>
                        {order.user?.firstName} {order.user?.lastName} | {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: `${STATUS_COLORS[order.status] || '#6b7280'}22`, color: STATUS_COLORS[order.status] || '#6b7280', borderRadius: 8, padding: '0.35rem 1rem', fontSize: 12, fontWeight: 700 }}>
                        {order.status}
                      </span>
                      <p style={{ margin: 0, color: '#10b981', fontWeight: 800, fontSize: 16 }}>ETB {order.finalAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    {order.orderItems?.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: 14, padding: '0.25rem 0' }}>
                        <span>{item.product?.name || 'Product'}</span>
                        <span>Qty: {item.quantity} × ETB {item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Update */}
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Truck size={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Update status:</span>
                    {STATUS_OPTIONS.map(s => (
                      <button key={s} onClick={() => updateShipping(order.id, s)}
                        disabled={order.status === s}
                        style={{ background: order.status === s ? `${STATUS_COLORS[s]}22` : 'rgba(255,255,255,0.06)', color: order.status === s ? STATUS_COLORS[s] : '#94a3b8', border: `1px solid ${order.status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.12)'}`, borderRadius: 8, padding: '0.35rem 0.875rem', fontSize: 12, fontWeight: 600, cursor: order.status === s ? 'default' : 'pointer' }}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
