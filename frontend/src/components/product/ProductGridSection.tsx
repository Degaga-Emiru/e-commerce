'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

interface ProductGridSectionProps {
  title: string;
  products: any[];
  loading: boolean;
  viewAllHref: string;
  isSpecial?: boolean;
}

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ 
  title, 
  products, 
  loading, 
  viewAllHref,
  isSpecial = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Only trigger scroll if content actually overflows (mobile view)
        if (scrollWidth > clientWidth) {
          let newScrollLeft = scrollLeft + clientWidth * 0.8;
          // Simple loop back to start if we exceed max width
          if (newScrollLeft + clientWidth >= scrollWidth + 10) {
            newScrollLeft = 0;
          }
          scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
      }
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`px-4 md:px-8 lg:px-12 py-12 ${isSpecial ? 'bg-gradient-to-br from-gray-50 to-gray-100/50' : 'bg-transparent'}`}>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            {isSpecial && (
               <div className="inline-flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest mb-2">
                 <Sparkles size={14} /> Premium Selection
               </div>
            )}
            <h2 className="text-3xl lg:text-4xl font-black italic text-gray-900 tracking-tighter uppercase">
              {title}
            </h2>
          </div>
          <Link 
            href={viewAllHref} 
            className="hidden sm:flex items-center gap-2 text-sm font-black text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div 
          ref={scrollRef}
          className="flex md:grid overflow-x-auto md:overflow-visible gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 border-transparent md:border-l md:border-t border-gray-100 snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0"
        >
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="min-w-[200px] md:min-w-0 aspect-[4/5] bg-gray-50 border border-gray-100 animate-pulse relative overflow-hidden flex items-center justify-center snap-center md:border-r md:border-b">
                 <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="min-w-[280px] md:col-span-full aspect-[4/1] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold italic snap-center">
               No products available in this section.
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="min-w-[200px] sm:min-w-[240px] md:min-w-0 border-transparent md:border-r md:border-b border-gray-100 snap-center">
                <ProductCard product={p} />
              </div>
            ))
          )}
          
          {/* Mobile "See All" card at the end of the scroll */}
          {!loading && products.length > 0 && (
            <div className="min-w-[160px] md:hidden flex items-center justify-center p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 snap-center">
               <Link href={viewAllHref} className="flex flex-col items-center gap-3 group">
                  <div className="p-4 bg-white rounded-full text-orange-500 shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <ArrowRight size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">View All Items</span>
               </Link>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Link 
            href={viewAllHref} 
            className="flex items-center justify-center gap-2 w-full max-w-sm bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-orange-500 transition-colors uppercase tracking-widest"
          >
            Explore {title}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
