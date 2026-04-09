'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AmazonProductCard from './AmazonProductCard';

interface Props {
  title: string;
  products: any[];
  loading?: boolean;
  viewAllHref?: string;
}

const HorizontalProductSection: React.FC<Props> = ({ title, products, loading, viewAllHref = "/products" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-10 border-b border-gray-50 last:border-0 overflow-hidden">
      <div className="container mx-auto px-6 mb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">{title}</h2>
          <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href={viewAllHref} className="hidden sm:flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest hover:underline">
            See all <ArrowRight size={14} />
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')} 
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto px-6 pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[240px] md:min-w-[280px] aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />
          ))
        ) : (
          products.map((product) => (
            <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-center">
              <AmazonProductCard product={product} />
            </div>
          ))
        )}
        
        {/* Mobile "See All" card at the end */}
        <div className="min-w-[180px] sm:hidden flex items-center justify-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 snap-center">
           <Link href={viewAllHref} className="flex flex-col items-center gap-3 group">
              <div className="p-4 bg-white rounded-full text-orange-500 shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                <ArrowRight size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">View All Items</span>
           </Link>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductSection;
