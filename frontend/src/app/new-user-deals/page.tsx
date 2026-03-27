'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Sparkles, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import api from '@/services/api';
import Link from 'next/link';

const NewUserDealsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        // Handle the structure { success: true, products: [...] }
        const data = response.data.products || response.data.content || (Array.isArray(response.data) ? response.data : []);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!isAuthenticated || !user?.isNewUser) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">New User Deals Only</h1>
          <p className="text-gray-500 mb-8 font-medium">
            This exclusive page is reserved for our new members. 
            Sign up today to unlock your 10% welcome discount!
          </p>
          <Link href="/register" className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 inline-block">
            Join the Club →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-500 to-orange-600 pt-20 pb-32 text-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 border border-white/30">
            <Sparkles size={16} /> Exclusive Welcome Gift
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Your New User Deals</h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto mb-10">
            Everything in our store is <span className="text-white font-black underline decoration-4 underline-offset-4 decoration-white/30">10% OFF</span> just for you. 
            Use code <span className="bg-white text-orange-600 px-3 py-1 rounded-lg font-mono font-black mx-1">WELCOME10</span> at checkout.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
              <p className="text-xs font-bold text-white/70 uppercase mb-1">Status</p>
              <p className="text-lg font-black tracking-wide">ACTIVE</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
              <p className="text-xs font-bold text-white/70 uppercase mb-1">Coupon</p>
              <p className="text-lg font-black tracking-wide">WELCOME10</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
              <p className="text-xs font-bold text-white/70 uppercase mb-1">Validity</p>
              <p className="text-lg font-black tracking-wide">FIRST ORDER</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-2xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Handpicked for You</h2>
              <p className="text-gray-500 mt-2 font-medium">Premium items with your exclusive 10% discount applied</p>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
               <ShoppingBag size={20} className="text-orange-500" />
               <p className="text-sm font-bold text-gray-700">{products.length} Products Available</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-orange-500" size={48} />
              <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Fresh Deals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                   <div className="absolute -top-3 -left-3 z-30 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                      Special Price
                   </div>
                   <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-bold">No products found. Stay tuned for new arrivals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 pb-24 text-center">
         <div className="bg-orange-50 rounded-[3rem] p-16 border border-orange-100">
            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Ready to Shop?</h3>
            <p className="text-gray-500 mb-10 max-w-xl mx-auto font-medium">Add your favorite items to your cart and the discount will be automatically applied with code WELCOME10.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link href="/products" className="bg-orange-500 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                  Browse All Products
               </Link>
               <Link href="/cart" className="bg-white text-gray-900 border-2 border-gray-100 px-12 py-5 rounded-[2rem] font-black text-xl hover:border-orange-500 transition-all active:scale-95">
                  Go to Cart
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default NewUserDealsPage;
