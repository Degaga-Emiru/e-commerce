'use client';
import { useEffect, useState } from 'react';
import api, { shippingApi } from '@/services/api';
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, ShieldCheck, MapPin } from 'lucide-react';

interface ShippingHistory {
  status: string;
  note: string;
  timestamp: string;
  updatedBy: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  finalAmount: number;
  orderDate: string;
  orderItems: { productName?: string; quantity: number; price: number }[];
  shippingAddress?: { street: string; city: string; state: string; zipCode: string; country: string };
  shipping?: { carrier?: string; trackingNumber?: string };
}

const STATUS_COLORS: Record<string, string> = { 
  PENDING:'#f59e0b', 
  PROCESSING:'#6366f1', 
  SHIPPED:'#06b6d4', 
  OUT_FOR_DELIVERY:'#f97316', 
  DELIVERED:'#10b981', 
  CANCELLED:'#ef4444' 
};

const STATUS_ICONS: Record<string, React.ReactNode> = { 
  PENDING:<Clock size={14}/>, 
  SHIPPED:<Truck size={14}/>, 
  DELIVERED:<CheckCircle size={14}/>, 
  CANCELLED:<XCircle size={14}/> 
};

const SHIPPING_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [history, setHistory] = useState<Record<number, ShippingHistory[]>>({});

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(r => setOrders(r.data?.data || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (orderId: number) => {
    if (expanded === orderId) {
      setExpanded(null);
    } else {
      setExpanded(orderId);
      if (!history[orderId]) {
        try {
          const res = await shippingApi.getHistory(orderId);
          setHistory(prev => ({ ...prev, [orderId]: res.data }));
        } catch (e) {
          console.error("Failed to fetch history");
        }
      }
    }
  };

  const getStepStatus = (currentStatus: string, step: string) => {
    const currentIndex = SHIPPING_STEPS.indexOf(currentStatus);
    const stepIndex = SHIPPING_STEPS.indexOf(step);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', padding:'2rem', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h1 style={{ margin:'0 0 2rem', fontSize:'2rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.02em' }}>📦 Order History</h1>

        {loading ? <p style={{ color:'#94a3b8', textAlign:'center', marginTop:'3rem' }}>Loading orders…</p>
        : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 2rem', background:'rgba(255,255,255,0.02)', borderRadius:32, border:'1px dashed rgba(255,255,255,0.1)' }}>
            <Package size={64} color="#6366f1" style={{ marginBottom:'1.5rem', opacity:0.5 }} />
            <p style={{ fontSize:20, fontWeight:600, color:'#cbd5e1', marginBottom:'0.5rem' }}>No orders found</p>
            <p style={{ color:'#94a3b8', marginBottom:'2rem' }}>You haven't placed any orders yet.</p>
            <a href="/products" style={{ background:'#6366f1', color:'#fff', padding:'0.75rem 1.5rem', borderRadius:12, fontWeight:700, textDecoration:'none', transition:'all 0.3s' }}>Explore Products</a>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, overflow:'hidden', transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Order Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.5rem', cursor:'pointer', flexWrap:'wrap', gap:'1rem' }}
                  onClick={() => toggleExpand(order.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ background:'rgba(99, 102, 241, 0.1)', padding:'0.75rem', borderRadius:14 }}>
                        <Package size={24} color="#6366f1" />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:15 }}>Order #{order.orderNumber}</span>
                        <span style={{ color:'#94a3b8', fontSize:12 }}>{new Date(order.orderDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
                    <div style={{ textAlign:'right' }}>
                        <span style={{ background:`${STATUS_COLORS[order.status]||'#6b7280'}15`, color:STATUS_COLORS[order.status]||'#6b7280', borderRadius:10, padding:'0.35rem 0.8rem', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', gap:6, marginBottom:4, border:`1px solid ${STATUS_COLORS[order.status]||'#6b7280'}30` }}>
                        {STATUS_ICONS[order.status]} {order.status}
                        </span>
                        <span style={{ color:'#10b981', fontWeight:800, fontSize:17 }}>ETB {order.finalAmount?.toLocaleString()}</span>
                    </div>
                    {expanded === order.id ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded === order.id && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'1.5rem', background:'rgba(0,0,0,0.1)' }}>
                    
                    {/* Shipping Timeline */}
                    {order.status !== 'CANCELLED' && (
                        <div style={{ marginBottom:'2.5rem', padding:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:20, border:'1px solid rgba(255,255,255,0.04)' }}>
                            <h4 style={{ color:'#f1f5f9', margin:'0 0 1.5rem', fontSize:14, fontWeight:700 }}>Tracking Timeline</h4>
                            <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                                <div style={{ position:'absolute', top:12, left:0, right:0, height:2, background:'rgba(255,255,255,0.05)', zIndex:0 }}></div>
                                {SHIPPING_STEPS.map((step, idx) => {
                                    const state = getStepStatus(order.status, step);
                                    return (
                                        <div key={step} style={{ display:'flex', flexDirection:'column', alignItems:'center', zIndex:1, flex:1 }}>
                                            <div style={{ 
                                                width:24, height:24, borderRadius:'50%', 
                                                background: state === 'completed' ? '#10b981' : state === 'active' ? '#6366f1' : '#1e293b',
                                                border: `4px solid ${state === 'active' ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                                                transition:'all 0.3s'
                                            }}>
                                                {state === 'completed' && <CheckCircle size={14} color="#fff" style={{ margin:1 }} />}
                                            </div>
                                            <span style={{ fontSize:10, color: state === 'pending' ? '#64748b' : '#cbd5e1', fontWeight:700, marginTop:8, textAlign:'center', textTransform:'uppercase' }}>
                                                {step.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'2rem' }}>
                        {/* Order Items */}
                        <div>
                            <p style={{ margin:'0 0 1rem', color:'#64748b', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>Purchased Items</p>
                            {order.orderItems?.map((item, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.75rem 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display:'flex', flexDirection:'column' }}>
                                        <span style={{ color:'#f1f5f9', fontSize:14, fontWeight:600 }}>{item.productName || 'Product'}</span>
                                        <span style={{ color:'#64748b', fontSize:12 }}>Qty: {item.quantity}</span>
                                    </div>
                                    <span style={{ color:'#cbd5e1', fontSize:14, fontWeight:700 }}>ETB {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Shipping & Payment Info */}
                        <div>
                            <p style={{ margin:'0 0 1rem', color:'#64748b', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>Shipping & Payment</p>
                            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                                {order.shippingAddress && (
                                    <div style={{ display:'flex', gap:10 }}>
                                        <MapPin size={16} color="#6366f1" style={{ flexShrink:0, marginTop:2 }} />
                                        <div style={{ color:'#cbd5e1', fontSize:13, lineHeight:'1.5' }}>
                                            {order.shippingAddress.street}<br/>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                        </div>
                                    </div>
                                )}
                                <div style={{ display:'flex', alignItems:'center', gap:8, color:'#10b981', fontSize:12, fontWeight:700, background:'rgba(16,185,129,0.05)', padding:'0.6rem 0.8rem', borderRadius:10 }}>
                                    <ShieldCheck size={16} /> Escrow Protection: {order.paymentStatus === 'COMPLETED' ? 'Funds Released' : 'Held in Escrow'}
                                </div>
                                {order.shipping?.trackingNumber && (
                                    <div style={{ color:'#6366f1', fontSize:13, fontWeight:700, padding:'0.5rem 0' }}>
                                        🎫 Tracking: {order.shipping.trackingNumber} ({order.shipping.carrier})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shipping History Log */}
                    {history[order.id] && history[order.id].length > 0 && (
                        <div style={{ marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                             <p style={{ margin:'0 0 1rem', color:'#64748b', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>Status History</p>
                             <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                                 {history[order.id].map((h, i) => (
                                     <div key={i} style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                                         <div style={{ width:8, height:8, borderRadius:'50%', background:'#6366f1', marginTop:5 }}></div>
                                         <div style={{ flex:1 }}>
                                             <div style={{ display:'flex', justifyContent:'space-between' }}>
                                                 <span style={{ color:'#f1f5f9', fontSize:13, fontWeight:700 }}>{h.status}</span>
                                                 <span style={{ color:'#64748b', fontSize:11 }}>{new Date(h.timestamp).toLocaleString()}</span>
                                             </div>
                                             <p style={{ color:'#94a3b8', fontSize:12, margin:'2px 0 0' }}>{h.note}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
