'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Package, Truck, CheckCircle, Clock, ArrowLeft, 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  ShoppingBag, ShieldCheck, ChevronRight, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SellerOrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

interface SellerOrderDetails {
  id: number;
  mainOrderId: number;
  orderNumber: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  status: string;
  subtotal: number;
  commissionAmount: number;
  payoutAmount: number;
  orderDate: string;
  shipping?: {
    carrier?: string;
    trackingNumber?: string;
    status?: string;
  };
  items: SellerOrderItem[];
}

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<SellerOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/seller/orders/${id}`);
      setOrder(res.data?.data || res.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to fetch order details');
      if (e.response?.status === 403) router.push('/seller/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      case 'PROCESSING': return '#6366f1';
      case 'PENDING': return '#f59e0b';
      case 'SHIPPED': return '#06b6d4';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <Info size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
        <p>This sub-order could not be found or you don't have access to it.</p>
        <button onClick={() => router.back()} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, marginTop: '1rem' }}>Return to Orders</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.6rem 1.2rem', borderRadius: 12, cursor: 'pointer', marginBottom: '2rem', fontSize: 13, fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Back to Seller Orders
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Sub-Order #{order.orderNumber}</h1>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>SELLER VIEW</div>
          </div>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: 14 }}>
            Original Main Order ID: <span style={{ color: '#cbd5e1' }}>#{order.mainOrderId}</span> | Placed on {new Date(order.orderDate).toLocaleString()}
          </p>
        </div>
        <div style={{ 
          background: `${getStatusColor(order.status)}15`, 
          color: getStatusColor(order.status), 
          padding: '0.6rem 1.5rem', 
          borderRadius: '12px', 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          border: `1px solid ${getStatusColor(order.status)}30` 
        }}>
          {order.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Customer Information */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.75rem' }}
        >
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9' }}>
            <User size={18} color="#6366f1" /> Customer Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 700 }}>
                {order.user.firstName[0]}{order.user.lastName[0]}
              </div>
              <div>
                <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>{order.user.firstName} {order.user.lastName}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.user.email}</p>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <Mail size={16} color="#64748b" style={{ marginTop: 2 }} />
                  <span style={{ color: '#cbd5e1' }}>{order.user.email}</span>
               </div>
               {order.user.phoneNumber && (
                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <Phone size={16} color="#64748b" style={{ marginTop: 2 }} />
                    <span style={{ color: '#cbd5e1' }}>{order.user.phoneNumber}</span>
                 </div>
               )}
            </div>
          </div>
        </motion.div>

        {/* Payout Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.75rem' }}
        >
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9' }}>
            <CreditCard size={18} color="#10b981" /> Financial Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
               <span>Items Subtotal</span>
               <span style={{ color: '#f1f5f9' }}>ETB {order.subtotal.toLocaleString()}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#f87171' }}>
               <span>Platform Commission (10%)</span>
               <span>- ETB {order.commissionAmount.toLocaleString()}</span>
             </div>
             <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>Net Payout</span>
               <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>ETB {order.payoutAmount.toLocaleString()}</span>
             </div>
             
             <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldCheck size={14} color="#10b981" style={{ marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981', lineHeight: 1.4 }}>
                  {order.status === 'DELIVERED' 
                    ? 'Funds successfully released to your available balance.' 
                    : 'Funds currently held in escrow. Will be released upon successful delivery.'}
                </p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Product List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.75rem', marginBottom: '2.5rem' }}
      >
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
          My Products in this Order
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={24} color="#475569" />
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{item.product.name}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    ETB {item.price.toLocaleString()} x {item.quantity}
                  </p>
                </div>
              </div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>ETB {item.totalPrice.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
