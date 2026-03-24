'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, ArrowLeft, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface Coupon {
  id: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  expiryDate: string;
  forNewUsers: boolean;
  timesUsed: number;
  usageLimit: number;
}

export default function MyCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons/active');
      setCoupons(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
      toast.error('Failed to load your coupons');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-500 mb-8 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-orange-100 text-orange-500 rounded-2xl">
            <Ticket size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Coupons & Offers</h1>
            <p className="text-slate-500 font-medium mt-1">Exclusive discounts available for your next purchase</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
            <Ticket size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No active coupons</h3>
            <p className="text-slate-500">Check back later for new promotions and exclusive offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-[1.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-orange-200 transition-all">
                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors"></div>
                
                <div className="relative z-10">
                  {coupon.forNewUsers && (
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-black text-emerald-600 bg-emerald-50 rounded-full tracking-wider uppercase border border-emerald-100">
                      New Users Only
                    </span>
                  )}
                  
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `ETB ${coupon.discountValue}`}
                    </span>
                    <span className="text-slate-400 font-bold mb-1 tracking-widest uppercase text-sm">OFF</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-700 mb-6">{coupon.name}</h3>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <span className="font-mono text-lg font-bold tracking-widest text-orange-600">{coupon.code}</span>
                    <button 
                      onClick={() => copyToClipboard(coupon.code)}
                      className="text-slate-400 hover:text-orange-500 transition-colors p-2 bg-white rounded-lg shadow-sm border border-slate-100"
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <AlertCircle size={14} />
                    <span>Valid until: {new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {coupon.usageLimit > 0 && (
                    <p className="text-xs text-slate-400 mt-2 font-medium">Limited to {coupon.usageLimit} uses</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
