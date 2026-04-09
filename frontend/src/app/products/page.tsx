'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import { Search, Loader2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { searchApi } from '@/services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    categoryId: null,
    minPrice: '',
    maxPrice: '',
    brand: '',
    minRating: null,
    sortBy: 'newest'
  });

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialQuery = searchParams?.get('q') || '';

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
    const newFilters = { ...filters, query: initialQuery };
    setFilters(newFilters);
    fetchProducts(newFilters);
  }, [initialQuery]);

  const handleFilterChange = (newFilters: any) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    // Update URL if query changed manually in the local input
    if (newFilters.query !== undefined) {
      const params = new URLSearchParams(window.location.search);
      if (newFilters.query) params.set('q', newFilters.query);
      else params.delete('q');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
    
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
             Our Collections
           </h1>
           <p className="text-gray-400 font-black tracking-widest text-xs uppercase">
             {products.length} precision pieces curated for excellence
           </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 group">
             <input
                type="text"
                placeholder="Search catalog..."
                value={filters.query}
                onChange={(e) => handleFilterChange({ query: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none font-bold"
             />
             <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
           </div>

           <select 
             value={filters.sortBy}
             onChange={(e) => handleSortChange(e.target.value)}
             className="bg-gray-50 border-none rounded-2xl py-4 px-8 font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer hidden lg:block"
           >
             <option value="newest">New Drops</option>
             <option value="price_asc">Price: Low - High</option>
             <option value="price_desc">Price: High - Low</option>
             <option value="best_selling">Popularity</option>
           </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <aside className="w-full lg:w-80 shrink-0">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </aside>

        <div className="flex-1 space-y-12">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-50 border border-gray-100 rounded-2xl animate-pulse relative overflow-hidden flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100 italic">
               <Search className="mx-auto text-gray-200 mb-6" size={64} />
               <p className="text-gray-400 font-bold text-xl">No precision pieces found matching your criteria.</p>
               <button 
                 onClick={() => handleFilterChange({ query: '', categoryId: null, minPrice: '', maxPrice: '', brand: '', minRating: null })}
                 className="text-orange-500 font-black mt-4 hover:underline"
               >
                 Flush all filters
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
