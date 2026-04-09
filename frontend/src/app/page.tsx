'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Ticket, Sparkles } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProductGridSection from '@/components/product/ProductGridSection';
import HeroCarousel from '@/components/home/HeroCarousel';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get('/products');
        const allProducts = productsRes.data.products || productsRes.data.data || [];
        setProducts(allProducts);
      } catch (error) {
        console.error('Failed to load marketplace pulse');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Section logic based on real data
  const trending = products.filter(p => (p.averageRating || 0) >= 4).slice(0, 12);
  const bestSellers = products.slice(0, 12); // Need distinct sets eventually
  const recommended = products.slice(5, 17);
  const newArrivals = products.slice().reverse().slice(0, 12);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      
      {/* Dynamic Hero Carousel */}
      <HeroCarousel />

      {/* Welcome Deals for New Users */}
      {user?.isNewUser && (
        <section className="px-4 lg:px-12 -mt-10 relative z-30 mb-10 max-w-[1600px] mx-auto w-full">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 md:p-8 rounded-[2rem] shadow-xl text-white flex flex-col sm:flex-row items-center justify-between border-4 border-white gap-4">
            <div className="flex items-center gap-6 w-full">
               <div className="p-4 bg-white/20 rounded-2xl shrink-0"><Ticket size={32} /></div>
               <div className="flex flex-col">
                 <h4 className="font-black text-xl lg:text-2xl tracking-tighter italic">NEW USER WELCOME GIFT</h4>
                 <p className="text-sm font-bold opacity-90 tracking-widest uppercase">Get 10% OFF your first pulse.</p>
               </div>
            </div>
            <Link href="/new-user-deals" className="w-full sm:w-auto text-center bg-white text-orange-600 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-transform shrink-0">
               CLAIM NOW
            </Link>
          </div>
        </section>
      )}

      {/* Main Content Sections - Using the new Grid approach */}
      <div className="flex flex-col gap-8 pb-12">
        <ProductGridSection 
          title="Trending Now" 
          products={trending} 
          loading={loading}
          viewAllHref="/products?sortBy=rating"
        />
        
        <ProductGridSection 
          title="Best Sellers" 
          products={bestSellers} 
          loading={loading}
          viewAllHref="/products?sortBy=orders"
          isSpecial={true}
        />

        {/* Mid-Page Promo Card */}
        <section className="px-4 md:px-8 lg:px-12 py-12">
           <div className="max-w-[1600px] mx-auto bg-gray-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden group shadow-2xl">
              <div className="relative z-10 space-y-6 max-w-xl">
                <span className="inline-flex items-center gap-2 text-orange-500 font-bold tracking-[0.3em] uppercase text-xs">
                  <Sparkles size={16} /> Membership Excellence
                </span>
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                  ULTIMATE PERFORMANCE PACK
                </h3>
                <p className="text-gray-400 text-sm md:text-base font-medium max-w-sm leading-relaxed">
                  Unlock precision tools, secure exclusive discounts, and claim priority shipping with Pulse Membership.
                </p>
                <div className="pt-4">
                  <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-orange-500/20">
                    Learn More & Join
                  </button>
                </div>
              </div>
              <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" className="absolute top-0 right-0 w-3/4 md:w-1/2 h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000" alt="Promotional graphic" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-0" />
           </div>
        </section>

        <ProductGridSection 
          title="Recommended for You" 
          products={recommended} 
          loading={loading}
          viewAllHref="/products?filter=recommended"
        />

        <ProductGridSection 
          title="New Arrivals" 
          products={newArrivals} 
          loading={loading}
          viewAllHref="/products?sortBy=createdAt"
        />
      </div>

      {/* Footer CTA */}
      <section className="px-6 py-24 bg-gray-50 text-center italic border-t border-gray-100">
        <h2 className="text-gray-900 text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase">NEVER MISS A PULSE.</h2>
        <p className="text-gray-500 font-medium tracking-widest uppercase text-sm mb-12">Discover perfection in every engineered detail.</p>
        <Link 
          href="/products" 
          className="bg-gray-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-orange-500 transition-colors shadow-2xl shadow-gray-200 inline-flex items-center gap-4 group"
        >
          Explore All Products <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
