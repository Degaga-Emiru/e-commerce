'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  finalAmount: number;
  orderDate: string;
  orderItems: { productName?: string; quantity: number; price: number }[];
  shippingAddress?: { street: string; city: string };
}

const STATUS_COLORS: Record<string, string> = { PENDING:'#f59e0b', PROCESSING:'#6366f1', SHIPPED:'#06b6d4', OUT_FOR_DELIVERY:'#f97316', DELIVERED:'#10b981', CANCELLED:'#ef4444' };
const STATUS_ICONS: Record<string, React.ReactNode> = { PENDING:<Clock size={14}/>, SHIPPED:<Truck size={14}/>, DELIVERED:<CheckCircle size={14}/>, CANCELLED:<XCircle size={14}/> };

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api.get('/orders/my-orders').then(r => setOrders(r.data?.data || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', padding:'2rem', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h1 style={{ margin:'0 0 2rem', fontSize:'1.75rem', fontWeight:800, color:'#f1f5f9' }}>📦 My Orders</h1>

        {loading ? <p style={{ color:'#94a3b8', textAlign:'center', marginTop:'3rem' }}>Loading orders…</p>
        : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
            <Package size={56} color="#6366f1" style={{ marginBottom:'1rem' }} />
            <p style={{ fontSize:18, fontWeight:600 }}>No orders yet</p>
            <a href="/products" style={{ color:'#6366f1', fontWeight:700 }}>Start Shopping →</a>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, overflow:'hidden' }}>
                {/* Order Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', cursor:'pointer', flexWrap:'wrap', gap:'1rem' }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:15 }}>Order #{order.orderNumber}</span>
                    <span style={{ color:'#94a3b8', fontSize:12 }}>{new Date(order.orderDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span style={{ background:`${STATUS_COLORS[order.status]||'#6b7280'}22`, color:STATUS_COLORS[order.status]||'#6b7280', borderRadius:8, padding:'0.3rem 0.875rem', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                    <span style={{ color:'#10b981', fontWeight:800, fontSize:16 }}>ETB {order.finalAmount?.toLocaleString()}</span>
                    {expanded === order.id ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded === order.id && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'1.25rem 1.5rem', background:'rgba(0,0,0,0.15)' }}>
                    <p style={{ margin:'0 0 0.75rem', color:'#94a3b8', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Items</p>
                    {order.orderItems?.map((item, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color:'#cbd5e1', fontSize:14 }}>{item.productName || 'Product'}</span>
                        <span style={{ color:'#94a3b8', fontSize:14 }}>×{item.quantity} — ETB {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {order.shippingAddress && (
                      <p style={{ margin:'0.875rem 0 0', color:'#94a3b8', fontSize:13 }}>
                        📍 {order.shippingAddress.street}, {order.shippingAddress.city}
                      </p>
                    )}
                    <div style={{ marginTop:'0.75rem', display:'flex', gap:'0.5rem' }}>
                      <span style={{ background:'rgba(255,255,255,0.05)', borderRadius:6, padding:'0.2rem 0.7rem', fontSize:12, color: order.paymentStatus === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
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
