'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Package, ChevronRight, 
  AlertCircle, CheckCircle2, Loader2, Search
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
}

const RefundSection = () => {
  const [refunds, setRefunds] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchRefunds();
  }, [user]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      // Admins fetch ALL orders to process platform-wide refunds
      const endpoint = isAdmin ? '/admin/orders' : '/orders/my-orders';
      const res = await api.get(endpoint);
      
      if (res.data.success) {
        // Handle variations in response structure between admin and customer endpoints
        const data = res.data.data || res.data.orders || res.data.result || [];
        setRefunds(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders for refunds:', err);
      toast.error('Could not load refund data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAndRefund = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order and request a refund?')) return;
    
    setProcessingId(orderId);
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        toast.success('Order cancelled and refund initiated');
        fetchRefunds();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdminProcessRefund = async (orderId: number) => {
    if (!confirm('Execute platform refund for this order? This will return funds to the customer.')) return;
    
    setProcessingId(orderId);
    try {
      const res = await api.post(`/admin/escrow/${orderId}/refund`);
      if (res.data.success) {
        toast.success('Platform refund completed successfully');
        fetchRefunds();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Refund processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter for display: only cancelled, failed, or pending/processing for cancellation
  const displayOrders = refunds.filter(o => 
    ['CANCELLED', 'REFUNDED', 'FAILED', 'PENDING', 'PROCESSING'].includes(o.status || '')
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 rounded-[2rem] border flex items-start gap-4 ${
        isAdmin ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'
      }`}>
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <RotateCcw className={isAdmin ? 'text-indigo-500' : 'text-orange-500'} size={24} />
        </div>
        <div>
          <h3 className={`font-black text-lg ${isAdmin ? 'text-indigo-900' : 'text-orange-900'}`}>
            {isAdmin ? 'Refund Administration' : 'Refunds & Cancellations'}
          </h3>
          <p className={`text-sm font-medium mt-1 leading-relaxed ${isAdmin ? 'text-indigo-700/70' : 'text-orange-700'}`}>
            {isAdmin 
              ? 'Process platform-level refunds for cancelled orders and manage failed transactions.' 
              : 'Manage your cancelled orders and track refund progress.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : displayOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {displayOrders.map((order) => {
              const status = order.status || '';
              const isRefunded = status === 'REFUNDED';
              const canCancel = ['PENDING', 'PROCESSING'].includes(status) && !isAdmin;
              const adminCanRefund = status === 'CANCELLED' && isAdmin;

              return (
                <div key={order.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <Package className="text-gray-400 group-hover:text-orange-500 transition-colors" size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <h4 className="font-black text-gray-900 text-lg">
                          {isRefunded ? 'Refund Completed' : 'Refundable Order'}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(order.createdAt || order.orderDate || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="font-black text-gray-900 text-xl">${order.finalAmount?.toFixed(2)}</p>
                      </div>
                      
                      <div className="min-w-[140px] text-right">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isRefunded ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isRefunded ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {canCancel && (
                          <button 
                            disabled={processingId === order.id}
                            onClick={() => handleCancelAndRefund(order.id)}
                            className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
                          >
                            {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Cancel & Refund
                          </button>
                        )}
                        
                        {adminCanRefund && (
                          <button 
                            disabled={processingId === order.id}
                            onClick={() => handleAdminProcessRefund(order.id)}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                          >
                            {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Execute Refund
                          </button>
                        )}

                        <Link 
                          href={isAdmin ? "/admin/dashboard" : "/profile/orders"}
                          className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-orange-500 transition-all border border-transparent hover:border-gray-100"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <RotateCcw size={40} className="text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">No Refund Activity</h4>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              {isAdmin 
                ? 'There are currently no orders requiring platform-level refund processing.' 
                : 'Orders that you cancel or return for a refund will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundSection;
