'use client';
import { useEffect, useState } from 'react';
import api, { shippingApi } from '@/services/api';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Edit3, 
  DollarSign, 
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Order { 
  id: number; 
  orderNumber: string; 
  user: { firstName: string; lastName: string; email: string }; 
  status: string; 
  subtotal: number;
  commissionAmount: number;
  payoutAmount: number;
  finalAmount: number; 
  orderDate: string; 
  mainOrderId?: number;
  items: any[]; 
  shipping?: { carrier?: string; trackingNumber?: string };
}

const STEPS = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
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

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    api.get('/seller/orders')
      .then(r => {
        const data = r.data?.orders || r.data?.data || r.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateShipping = async (mainOrderId: number | undefined, status: string) => {
    if (!mainOrderId) return toast.error('Order ID missing');
    try {
      await shippingApi.updateStatus(mainOrderId, { 
        status, 
        carrier: trackingData.carrier, 
        trackingNumber: trackingData.trackingNumber,
        note: trackingData.note || `Status updated to ${status}` 
      });
      toast.success(`Order marked as ${status.replace(/_/g, ' ')}`);
      setEditingTracking(null);
      fetchOrders();
    } catch (e: any) { 
        toast.error(e.response?.data?.message || 'Update failed'); 
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Order Management</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Monitor shipments, manage order states and track payouts.</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
           <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '5rem', textAlign: 'center', color: '#64748b' }}>
          <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No orders matching your shop yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order, i) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflow: 'hidden' }}
            >
              {/* Order Header */}
              <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.6rem', borderRadius: '12px' }}><ShoppingBag size={20} /></div>
                  <div>
                    <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700 }}>Order #{order.orderNumber}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Placed on {new Date(order.orderDate).toLocaleDateString()} | Customer: {order.user?.firstName} {order.user?.lastName}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      background: `${STATUS_COLORS[order.status]}15`, 
                      color: STATUS_COLORS[order.status],
                      border: `1px solid ${STATUS_COLORS[order.status]}30`
                   }}>
                     {order.status}
                   </div>
                   <Link href={`/seller/orders/${order.id}`} style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     Details <ChevronRight size={16} />
                   </Link>
                </div>
              </div>

              {/* Order Body */}
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Items & Financials */}
                <div>
                   <h5 style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items & Payout</h5>
                   <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                          <span>{item.product?.name} <span style={{ color: '#64748b' }}>x {item.quantity}</span></span>
                          <span style={{ fontWeight: 600 }}>ETB {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <span>Order Subtotal</span>
                          <span>ETB {order.subtotal?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#f87171' }}>
                          <span>Platform Commission (10%)</span>
                          <span>- ETB {order.commissionAmount?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#10b981', fontWeight: 800, marginTop: '0.25rem' }}>
                          <span>Your Net Payout</span>
                          <span>ETB {order.payoutAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                   
                   <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: order.status === 'DELIVERED' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {order.status === 'DELIVERED' ? (
                        <><CheckCircle size={14} /> Funds released to available balance</>
                      ) : (
                        <><Clock size={14} /> Payout pending (held in escrow until delivery)</>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
