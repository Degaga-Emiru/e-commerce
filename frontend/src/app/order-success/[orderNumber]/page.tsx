'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowRight, ShieldCheck, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const verifyPayment = async () => {
    setStatus('loading');
    try {
      // 1. Primary: Verify payment via backend Chapa verification
      const res = await api.get(`/payments/verify/${orderNumber}`);
      
      if (res.data.status === 'success' || (res.data.data && res.data.data.status === 'success')) {
        setStatus('success');
        toast.success("Payment verified successfully!");
      } else {
        // Capture message from Chapa or Backend
        setErrorDetails(res.data.message || "Transaction status: " + (res.data.data?.status || "Unknown"));
        // 2. Secondary: Fallback - check order status directly 
        await checkOrderStatusFallback();
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const msg = error.response?.data?.message || error.message;
      setErrorDetails(msg);
      // Try fallback on error too (e.g. 400 from verify)
      await checkOrderStatusFallback();
    }
  };

  const checkOrderStatusFallback = async () => {
    try {
      const orderRes = await api.get(`/orders/number/${orderNumber}`);
      const orderData = orderRes.data.data || orderRes.data.order;
      
      // If paymentStatus is already COMPLETED, then we are good
      if (orderData.paymentStatus === 'COMPLETED' || orderData.paymentStatus === 'SUCCESS') {
        setStatus('success');
        return;
      }
      
      setErrorDetails("Transaction verification failed. If you have been charged, please wait a few minutes for the status to update.");
      setStatus('failed');
    } catch (e) {
      setStatus('failed');
    }
  };

  useEffect(() => {
    if (orderNumber) {
      verifyPayment();
    }
  }, [orderNumber]);

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 size={100} className="text-orange-500 animate-spin" />
          <ShoppingBag size={40} className="absolute inset-0 m-auto text-orange-200" />
        </div>
        <div className="text-center px-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verifying Payment...</h1>
          <p className="text-gray-500 font-medium mt-2">Connecting to secure gateway. Order #{orderNumber}</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 flex flex-col items-center max-w-lg w-full text-center shadow-2xl shadow-red-500/10 transition-all transform hover:scale-[1.01]">
          <div className="bg-red-50 p-6 rounded-full mb-8">
            <XCircle size={60} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4 text-orange-gradient">Payment Unsuccessful</h1>
          <p className="text-gray-600 mb-10 leading-relaxed font-medium">
            {errorDetails || "Something went wrong with your payment verification. Your order might still be pending or the bank is processing the transaction."}
          </p>
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={verifyPayment}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
            >
              <RefreshCcw size={20} />
              Try Verification Again
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/profile/orders')}
                className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Track Order
              </button>
              <button 
                onClick={() => router.push('/cart')}
                className="bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl shadow-orange-500/10 flex flex-col items-center text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>

          <div className="relative mb-10">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 transform transition-transform animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-full border-4 border-green-50 shadow-xl">
              <CheckCircle size={80} className="text-green-500" />
            </div>
          </div>

          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Order Confirmed!</h1>
          <div className="bg-orange-50 px-6 py-2 rounded-full mb-8 border border-orange-100">
            <p className="text-orange-600 font-black text-sm tracking-widest uppercase">Order #{orderNumber}</p>
          </div>

          <p className="text-gray-500 text-lg font-medium max-w-md leading-relaxed mb-12">
            Exciting news! Your payment has been successfully processed. We've started preparing your items for delivery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
            <Link href="/profile/orders" className="group flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:border-orange-500/30 hover:shadow-xl transition-all h-full">
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 font-inter">Track Progress</span>
                <span className="text-gray-900 font-bold block">Order Details</span>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={24} />
            </Link>

            <Link href="/products" className="group flex items-center justify-between p-6 bg-orange-500 rounded-[2rem] border border-orange-400 hover:bg-orange-600 hover:shadow-xl shadow-lg shadow-orange-500/20 transition-all h-full">
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest text-orange-100 mb-1 font-inter">Keep Shopping</span>
                <span className="text-white font-bold block">Back to Store</span>
              </div>
              <ShoppingBag className="text-orange-300 group-hover:text-white transition-all" size={24} />
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-2 text-gray-400">
            <ShieldCheck size={18} className="text-green-500" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Escrow Protection Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
