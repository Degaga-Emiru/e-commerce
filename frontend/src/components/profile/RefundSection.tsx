'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Package, ChevronRight, 
  AlertCircle, CheckCircle2, Loader2, Search
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        // Filter for refunded or cancelled orders
        const filtered = res.data.data.filter((order: any) => 
          ['REFUNDED', 'CANCELLED', 'FAILED'].includes(order.status)
        );
        setRefunds(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch orders for refunds:', err);
      toast.error('Could not load refund data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <AlertCircle className="text-orange-500" size={24} />
        </div>
        <div>
          <h3 className="font-black text-orange-900 text-lg">Refund Policy</h3>
          <p className="text-sm text-orange-700 font-medium mt-1 leading-relaxed">
            Refunds are processed within 3-5 business days after a return is confirmed. 
            Cancelled orders are refunded immediately to your original payment method.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : refunds.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {refunds.map((refund) => (
              <div key={refund.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                      <Package className="text-gray-400 group-hover:text-orange-500 transition-colors" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order {refund.orderNumber}</p>
                      <h4 className="font-black text-gray-900 text-lg">Refund for Order</h4>
                      <p className="text-sm text-gray-500 font-medium">{new Date(refund.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                      <p className="font-black text-gray-900 text-xl">${refund.finalAmount.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-right min-w-[120px]">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        refund.status === 'REFUNDED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {refund.status === 'REFUNDED' ? <CheckCircle2 size={14} /> : <RotateCcw size={14} />}
                        {refund.status}
                      </span>
                    </div>

                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-orange-500 hover:shadow-md transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <RotateCcw size={40} className="text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">No Refunds Found</h4>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              Any cancelled or refunded orders will appear here for your records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundSection;
