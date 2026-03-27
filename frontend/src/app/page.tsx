'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';
import { Truck, ShieldCheck, Headphones, Zap, ArrowRight, Star, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200",
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1200"
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Premium Wireless Headphones', price: 299.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { id: 2, name: 'Minimalist Smart Watch', price: 199.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { id: 3, name: 'Pro Camera Lens', price: 899.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
  { id: 4, name: 'Leather Travel Bag', price: 150.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500' },
  { id: 5, name: 'Noise Cancelling Buds', price: 129.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
  { id: 6, name: 'Mechanical Keyboard', price: 159.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500' },
  { id: 7, name: 'Ergonomic Mouse', price: 79.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500' },
  { id: 8, name: 'Portable SSD 2TB', price: 189.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1597333332034-77cc6777c59e?w=500' },
  { id: 9, name: '4K Mirrorless Camera', price: 1200.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
  { id: 10, name: 'Smart Home Speaker', price: 99.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500' },
  { id: 11, name: 'Designer Sunglasses', price: 250.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500' },
  { id: 12, name: 'Waterproof Laptop Sleeve', price: 45.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { id: 13, name: 'Gaming Chair Elite', price: 349.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fce68?w=500' },
  { id: 14, name: 'Studio Microphone', price: 220.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500' },
  { id: 15, name: 'USB-C Hub Pro', price: 65.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1572043818504-f298227c8eec?w=500' },
  { id: 16, name: 'Fitness Tracker Band', price: 59.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e3fc32e?w=500' },
  { id: 17, name: 'Wireless Charging Pad', price: 39.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1615526675159-e248c301fe32?w=500' },
  { id: 18, name: 'Premium Coffee Maker', price: 129.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500' },
  { id: 19, name: 'Electric Scooter X', price: 499.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500' },
  { id: 20, name: 'Bamboo Desk Organizer', price: 35.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=500' },
  { id: 21, name: 'Ultra-thin Power Bank', price: 49.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a2?w=500' },
  { id: 22, name: 'VR Headset Pro', price: 399.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500' },
  { id: 23, name: 'Smart Table Lamp', price: 69.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500' },
  { id: 24, name: 'Foldable Drone 4K', price: 550.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500' },
  { id: 25, name: 'Luxury Fountain Pen', price: 85.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500' },
  { id: 26, name: 'Graphic Drawing Tablet', price: 199.99, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=500' },
  { id: 27, name: 'Acoustic Guitar Elite', price: 450.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=500' },
  { id: 28, name: 'Dual Monitor Stand', price: 95.00, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500' },
  { id: 29, name: 'Premium Yoga Mat', price: 65.00, averageRating: 5, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500' },
  { id: 30, name: 'Stainless Water Bottle', price: 29.99, averageRating: 4, imageUrl: 'https://images.unsplash.com/photo-1602143303410-7ce0491844ccd?w=500' }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isNewUser = user?.isNewUser;

  // Hero Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, productsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products')
        ]);
        
        const featured = featuredRes.data.products || [];
        const arrivals = productsRes.data.products || [];

        // Combine with mock if short (to reach 25+)
        setFeaturedProducts(featured.length >= 25 ? featured : [...featured, ...MOCK_PRODUCTS].slice(0, 30));
        setNewArrivals(arrivals.length >= 25 ? arrivals : [...arrivals, ...MOCK_PRODUCTS].slice(0, 30));
      } catch (error) {
        console.error('Error fetching home data:', error);
        setFeaturedProducts(MOCK_PRODUCTS);
        setNewArrivals(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col space-y-32 pb-32 bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {HERO_IMAGES.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
            <img 
              src={img} 
              alt={`Slide ${idx}`} 
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
            />
          </div>
        ))}

        <div className="container mx-auto px-6 z-20 relative">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 px-4 py-2 rounded-full overflow-hidden">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Premium Selection 2026</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-white">
              ELEVATE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-black">LIFESTYLE</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg font-medium leading-relaxed">
              Curated precision-engineered essentials for the modern pioneer. Discover excellence in every detail with our expanded collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link 
                href="/products" 
                className="group relative w-full sm:w-auto bg-orange-500 text-white px-12 py-6 rounded-2xl font-black text-lg overflow-hidden transition-all hover:bg-orange-600 shadow-2xl shadow-orange-500/40"
              >
                <div className="relative z-10 flex items-center justify-center">
                  EXPLORE SHOP <ArrowRight size={22} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setCurrentHero(i)} className={`h-1.5 transition-all duration-500 rounded-full ${i === currentHero ? 'w-12 bg-orange-500' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
      </section>

      {/* New User Welcome Banner */}
      {isNewUser && (
        <section className="container mx-auto px-6 -mt-16 relative z-30">
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Ticket size={36} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">🎉 Welcome! Get 10% OFF</h3>
                <p className="text-white/90 font-medium mt-1">Use code <span className="font-mono font-black bg-white/20 px-3 py-1 rounded-lg ml-1">WELCOME10</span> on your first order</p>
              </div>
            </div>
            <Link href="/new-user-deals" className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-xl shrink-0">
              Claim Your Deals →
            </Link>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Truck />, title: 'Globally Fast', desc: 'Secure air-freight shipping' },
            { icon: <ShieldCheck />, title: 'Elite Security', desc: 'Encrypted payment vault' },
            { icon: <Headphones />, title: 'Concierge', desc: 'Dedicated luxury support' },
            { icon: <Zap />, title: 'Pulse Speed', desc: 'Real-time order tracking' },
          ].map((feature, idx) => (
            <div key={idx} className="group p-10 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-orange-200 hover:bg-white transition-all duration-500">
              <div className="bg-white text-orange-500 w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500">
                {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 28 })}
              </div>
              <h3 className="text-xl font-black mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals - Horizontal Scroll */}
      <section className="space-y-12">
        <div className="container mx-auto px-6 flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter italic uppercase text-gray-900">New Arrivals</h2>
            <div className="h-1.5 w-32 bg-orange-500"></div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="p-4 rounded-full border border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm active:scale-90"><ChevronLeft size={24} /></button>
            <button onClick={() => scroll('right')} className="p-4 rounded-full border border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm active:scale-90"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div ref={scrollRef} className="flex overflow-x-auto gap-8 px-6 pb-8 snap-x snap-mandatory hide-scrollbar group">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="min-w-[350px] aspect-[4/5] bg-gray-100 animate-pulse rounded-[2.5rem]" />)
          ) : (
            newArrivals.map((product) => (
              <div key={product.id} className="min-w-[320px] md:min-w-[380px] snap-center">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Trending Section - Infinite Marquee */}
      <section className="bg-gray-900 py-32 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full p-4 overflow-hidden whitespace-nowrap z-0 opacity-10 pointer-events-none select-none">
          <span className="text-[15rem] font-black text-white italic tracking-tighter">EXCELLENCE • ELITE • QUALITY • LUXURY • TRENDING • </span>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 mb-20 text-center">
           <h2 className="text-white text-5xl font-black mb-4 uppercase tracking-[0.2em]">Trending Now</h2>
           <p className="text-orange-500 font-bold text-lg tracking-widest">THE MOST LOVED COLLECTION</p>
        </div>

        <div className="flex animate-marquee hover:pause whitespace-nowrap gap-10">
          {[...featuredProducts, ...featuredProducts].map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-[320px] shrink-0">
               <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="container mx-auto px-6">
        <div className="bg-orange-500 rounded-[4rem] p-12 md:p-24 text-white grid grid-cols-1 lg:grid-cols-2 gap-16 items-center overflow-hidden relative">
          <div className="space-y-8 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black leading-none uppercase">Pure <br /> Performance</h2>
            <p className="text-xl font-medium opacity-95 max-w-md leading-relaxed">Join the pulse of the digital era. Our premium ecosystem provides unparalleled quality and seamless integration.</p>
            <div className="flex flex-wrap gap-8">
              <Link href="/products" className="bg-white text-orange-500 px-12 py-6 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-2xl">SHOP ELITE</Link>
              <div className="flex items-center -space-x-4">
                {[1,2,3,4,5].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-16 h-16 rounded-full border-4 border-orange-500 shadow-2xl object-cover" alt="user" />)}
              </div>
            </div>
          </div>
          <div className="relative group perspective-1000">
             <img src="https://images.unsplash.com/photo-1620712943543-bcc4628c71d0?w=1000" alt="Elite" className="w-full h-full object-cover rounded-[4rem] shadow-2xl transition-transform duration-1000 group-hover:rotate-y-12" />
             <div className="absolute -top-10 -right-10 bg-white/20 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/20 hidden md:block animate-bounce-slow shadow-2xl">
                <div className="text-5xl font-black">99%</div>
                <div className="text-[10px] font-black opacity-80 uppercase tracking-[0.3em]">Precision</div>
             </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-6">
        <div className="bg-black rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <h2 className="text-white text-5xl md:text-7xl font-black uppercase">Join the Pulse</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">Subscribe for early access to elite drops and exclusive luxury membership benefits.</p>
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 pt-4">
                <input type="email" placeholder="Your premium email" className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-2xl py-6 px-10 outline-none focus:border-orange-500 transition-all font-bold" />
                <button className="bg-orange-500 text-white px-12 py-6 rounded-2xl font-black hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-95 transition-all">SIGN UP</button>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full"></div>
        </div>
      </section>
    </div>
  );
}
