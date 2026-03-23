'use client';
import { useEffect, useState } from 'react';
import api, { shippingApi } from '@/services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Truck, CheckCircle, Clock, Save, Edit3 } from 'lucide-react';

interface Order { 
  id: number; 
  orderNumber: string; 
  user: { firstName: string; lastName: string; email: string }; 
  status: string; 
  finalAmount: number; 
  orderDate: string; 
  orderItems: any[]; 
  shipping?: { carrier?: string; trackingNumber?: string };
}

const STATUS_OPTIONS = ['PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = { 
  PENDING:'#f59e0b', 
  PROCESSING:'#6366f1', 
  SHIPPED:'#06b6d4', 
  OUT_FOR_DELIVERY:'#f97316', 
  DELIVERED:'#10b981',
  CANCELLED:'#ef4444'
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTracking, setEditingTracking] = useState<number | null>(null);
  const [trackingData, setTrackingData] = useState({ carrier: '', trackingNumber: '', note: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    api.get('/seller/orders')
      .then(r => {
        const data = r.data?.orders || r.data?.data || r.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateShipping = async (orderId: number, status: string) => {
    try {
      await shippingApi.updateStatus(orderId, { 
        status, 
        carrier: trackingData.carrier, 
        trackingNumber: trackingData.trackingNumber,
        note: trackingData.note || `Status updated to ${status}` 
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Status updated to ${status}`);
      setEditingTracking(null);
      setTrackingData({ carrier: '', trackingNumber: '', note: '' });
      fetchOrders(); // Refresh to get all data
    } catch (e: any) { 
        toast.error(e.response?.data?.message || 'Failed'); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 2rem', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>📦 Seller Order Management</h1>

        {loading ? <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '3rem' }}>Loading orders…</p>
          : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <ShoppingBag size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '1.5rem', transition:'all 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 16 }}>Order #{order.orderNumber}</p>
                      <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: 13 }}>
                        {order.user?.firstName} {order.user?.lastName} | {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: `${STATUS_COLORS[order.status] || '#6b7280'}22`, color: STATUS_COLORS[order.status] || '#6b7280', borderRadius: 8, padding: '0.35rem 1rem', fontSize: 12, fontWeight: 700, border: `1px solid ${STATUS_COLORS[order.status] || '#6b7280'}44` }}>
                        {order.status}
                      </span>
                      <p style={{ margin: 0, color: '#10b981', fontWeight: 800, fontSize: 18 }}>ETB {order.finalAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border:'1px solid rgba(255,255,255,0.05)' }}>
                    {order.orderItems?.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: 14, padding: '0.3rem 0' }}>
                        <span style={{ fontWeight: 500 }}>{item.product?.name || 'Product'}</span>
                        <span style={{ color: '#94a3b8' }}>Qty: {item.quantity} × ETB {item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Info */}
                  {editingTracking === order.id ? (
                    <div style={{ marginTop: '1.5rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', background:'rgba(255,255,255,0.03)', padding:'1rem', borderRadius:16 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            <label style={{ color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>Carrier</label>
                            <input 
                                type="text" placeholder="e.g. FedEx, DHL" 
                                value={trackingData.carrier} 
                                onChange={e => setTrackingData({...trackingData, carrier: e.target.value})}
                                style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'0.5rem', color:'#fff', outline:'none' }}
                            />
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            <label style={{ color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>Tracking Number</label>
                            <input 
                                type="text" placeholder="Tracking #" 
                                value={trackingData.trackingNumber} 
                                onChange={e => setTrackingData({...trackingData, trackingNumber: e.target.value})}
                                style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'0.5rem', color:'#fff', outline:'none' }}
                            />
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6, gridColumn:'1 / -1' }}>
                            <label style={{ color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>Note (Optional)</label>
                            <input 
                                type="text" placeholder="Message to customer" 
                                value={trackingData.note} 
                                onChange={e => setTrackingData({...trackingData, note: e.target.value})}
                                style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'0.5rem', color:'#fff', outline:'none' }}
                            />
                        </div>
                        <div style={{ gridColumn:'1 / -1', display:'flex', justifyContent:'flex-end', gap:'0.5rem' }}>
                            <button onClick={() => setEditingTracking(null)} style={{ background:'transparent', color:'#94a3b8', border:'none', padding:'0.5rem 1rem', cursor:'pointer' }}>Cancel</button>
                            <button onClick={() => setEditingTracking(null)} style={{ background:'#6366f1', color:'#white', border:'none', borderRadius:8, padding:'0.5rem 1.5rem', fontWeight:600, cursor:'pointer' }}>Done</button>
                        </div>
                    </div>
                  ) : (
                    <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#94a3b8', fontSize:13 }}>
                        <div style={{ display:'flex', gap:'1rem' }}>
                            {order.shipping?.carrier && <span>🚚 {order.shipping.carrier}</span>}
                            {order.shipping?.trackingNumber && <span>🎫 {order.shipping.trackingNumber}</span>}
                        </div>
                        <button onClick={() => {
                                setEditingTracking(order.id);
                                setTrackingData({
                                    carrier: order.shipping?.carrier || '',
                                    trackingNumber: order.shipping?.trackingNumber || '',
                                    note: ''
                                });
                            }} 
                            style={{ display:'flex', alignItems:'center', gap:4, background:'transparent', border:'none', color:'#6366f1', cursor:'pointer', fontWeight:600 }}>
                            <Edit3 size={14} /> Edit Tracking
                        </button>
                    </div>
                  )}

                  {/* Status Buttons */}
                  <div style={{ marginTop: '1.25rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight:600 }}>Set Status:</span>
                    {STATUS_OPTIONS.map(s => (
                      <button key={s} onClick={() => updateShipping(order.id, s)}
                        disabled={order.status === s}
                        style={{ 
                          background: order.status === s ? `${STATUS_COLORS[s]}22` : 'rgba(255,255,255,0.06)', 
                          color: order.status === s ? STATUS_COLORS[s] : '#cbd5e1', 
                          border: `1px solid ${order.status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.1)'}`, 
                          borderRadius: 10, padding: '0.4rem 1rem', fontSize: 12, fontWeight: 700, 
                          cursor: order.status === s ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: order.status === s ? 1 : 0.7
                        }}>
                        {s.replace(/_/g, ' ')}
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
