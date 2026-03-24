'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Package, Truck, CheckCircle, Clock, ArrowLeft, 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  ExternalLink, ShoppingBag, ShieldCheck
} from 'lucide-react';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string;
}

interface ShippingAddress {
  recipientName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

interface OrderDetails {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  orderItems: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
}

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to fetch order');
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
      case 'OUT_FOR_DELIVERY': return '#f97316';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Clock className="animate-spin" color="#6366f1" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <p>Order not found</p>
        <button onClick={() => router.back()} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        <button 
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.6rem 1.2rem', borderRadius: 12, cursor: 'pointer', marginBottom: '1.5rem', fontSize: 13, fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Order #{order.orderNumber}</h1>
            <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: 14 }}>Placed on {new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ background: `${getStatusColor(order.status)}22`, color: getStatusColor(order.status), padding: '0.5rem 1.2rem', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1px solid ${getStatusColor(order.status)}44` }}>
              {order.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Customer & Address */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#6366f1" /> Delivery Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderTop: '0px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Shipping Address</h4>
                {order.shippingAddress ? (
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{order.shippingAddress.recipientName || 'Recipient'}</p>
                    <p style={{ margin: 0 }}><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> {order.shippingAddress.street}</p>
                    <p style={{ margin: 0 }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p style={{ margin: 0 }}>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phoneNumber && <p style={{ margin: '4px 0 0' }}><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> {order.shippingAddress.phoneNumber}</p>}
                  </div>
                ) : (
                  <p style={{ color: '#ef4444', fontSize: 13 }}>No shipping address recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#6366f1" /> Logistics Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>Status</span>
                <span style={{ fontWeight: 600 }}>{order.status}</span>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>Received: {new Date(order.orderDate).toLocaleString()}</span>
                  </div>
                  {order.shippedDate && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
                      <span style={{ fontSize: 13, color: '#cbd5e1' }}>Shipped: {new Date(order.shippedDate).toLocaleString()}</span>
                    </div>
                  )}
                  {order.deliveredDate && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: 13, color: '#cbd5e1' }}>Delivered: {new Date(order.deliveredDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} color="#6366f1" /> Ordered Products
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.orderItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={24} color="#475569" />
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{item.productName}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Qty: {item.quantity}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>ETB {(item.unitPrice * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>Order Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>ETB {order.finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
