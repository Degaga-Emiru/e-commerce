'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '@/services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch real data from backend
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        
        setProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback for demo if backend is empty
        if (products.length === 0) {
          setProducts([
            { id: 1, title: 'Premium Headphones', price: 199.99, rating: 5, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
            { id: 2, title: 'Smart Watch', price: 299.99, rating: 4, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const title = p.name || p.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const catName = typeof p.category === 'string' ? p.category : p.category?.name;
    const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Browse Products</h1>
          <p className="text-gray-500 mt-2">Discover our high-quality collection</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          </div>
          
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">
            <SlidersHorizontal size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-10">
          <div>
            <h3 className="font-bold text-xl mb-6 flex items-center">
              Categories
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                    selectedCategory === 'All' 
                    ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
                  }`}
                >
                  All Items
                </button>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === cat.name 
                      ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
             <h4 className="font-bold text-orange-600 mb-2 italic text-sm">PRO TIP</h4>
             <p className="text-gray-600 text-xs leading-relaxed">
               Use the search bar above to instantly find specific models or brands.
             </p>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
               <p className="text-gray-500 font-medium">Loading catalog...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-300">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                <Search size={48} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8">
                Try adjusting your search or category filters to find what you're looking for.
              </p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
