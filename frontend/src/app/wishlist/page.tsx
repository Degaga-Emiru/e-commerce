'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, refreshWishlist } = useWishlist();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Vault...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="bg-gray-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
            <Heart size={48} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">Your Vault Awaits</h1>
          <p className="text-gray-500 font-medium leading-relaxed">Login to secure your favorite essentials and sync them across your precision-engineered workspace.</p>
          <Link href="/login" className="bg-orange-500 text-white font-black block w-full py-5 rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all uppercase tracking-widest text-sm">
            Sign In to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-16 border-b-4 border-gray-900 pb-12">
        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tighter text-gray-900 italic uppercase leading-none">The <span className="text-orange-500">Vault</span></h1>
          <p className="text-gray-400 font-black tracking-widest text-xs uppercase italic">{items.length} Precision Items Preserved</p>
        </div>
        <Link href="/products" className="text-gray-900 font-black flex items-center gap-2 hover:text-orange-500 transition-all uppercase tracking-widest text-xs">
          Explore the Catalog <ArrowRight size={16} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="max-w-sm mx-auto space-y-8">
            <ShoppingBag className="mx-auto text-gray-200" size={80} />
            <div>
               <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Vault Empty</h2>
               <p className="text-gray-400 font-bold mt-2">No selections have been made for preservation yet.</p>
            </div>
            <Link href="/products" className="bg-orange-500 text-white font-black px-12 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 uppercase tracking-widest text-xs inline-block">
              Start Preserving
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {items.map((item) => (
            <div key={item.id} className="relative group animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${items.indexOf(item) * 50}ms` }}>
               <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
