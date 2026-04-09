'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi } from '@/services/api';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import { Loader2, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: initialQuery,
    categoryId: null,
    minPrice: '',
    maxPrice: '',
    brand: '',
    minRating: null,
    sortBy: 'newest'
  });

  const fetchProducts = async (currentFilters: any) => {
    setLoading(true);
    try {
      const response = await searchApi.filterProducts(currentFilters);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If query is present, use it. If empty, it will trigger the "Reset Behavior"
    // by fetching with an empty query (which backend filter handles by returning all)
    const newFilters = { ...filters, query: initialQuery || '' };
    setFilters(newFilters);
    fetchProducts(newFilters);
  }, [initialQuery]);

  const handleFilterChange = (newFilters: any) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    fetchProducts(updated);
  };

  const handleSortChange = (sortBy: string) => {
    const updated = { ...filters, sortBy };
    setFilters(updated);
    fetchProducts(updated);
  };

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 mb-16">
        <div className="space-y-2">
           <h1 className="text-5xl font-black tracking-tighter uppercase italic">
             {filters.query ? `Results for "${filters.query}"` : 'Explore Collection'}
           </h1>
           <p className="text-gray-400 font-black tracking-widest text-xs">FOUND {products.length} PRECISION PIECES</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
           <select 
             value={filters.sortBy}
             onChange={(e) => handleSortChange(e.target.value)}
             className="bg-gray-50 border-none rounded-xl py-4 px-6 font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer min-w-[180px]"
           >
             <option value="newest">Newest Drops</option>
             <option value="price_asc">Price: Low - High</option>
             <option value="price_desc">Price: High - Low</option>
             <option value="best_selling">Most Loved</option>
           </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Mobile Filter Toggle placeholder later, now sidebar is responsive */}
        <FilterSidebar onFilterChange={handleFilterChange} />

        <div className="flex-1 space-y-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100 italic">
               <Search className="mx-auto text-gray-200 mb-6" size={64} />
               <p className="text-gray-400 font-bold text-xl">No precision pieces found matching your criteria.</p>
               <button 
                 onClick={() => handleFilterChange({ categoryId: null, minPrice: '', maxPrice: '', brand: '', minRating: null })}
                 className="text-orange-500 font-black mt-4 hover:underline"
               >
                 Clear all filters
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
