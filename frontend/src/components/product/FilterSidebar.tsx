'use client';

import React, { useState, useEffect } from 'react';
import { categoryApi } from '@/services/api';
import { ChevronDown, ChevronRight, Star, Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    categoryId: null as number | null,
    minPrice: '',
    maxPrice: '',
    brand: '',
    minRating: null as number | null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        // Assuming the backend returns hierarchical categories
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const newFilters = { ...filters, [type === 'min' ? 'minPrice' : 'maxPrice']: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategorySelect = (id: number | null) => {
    const newFilters = { ...filters, categoryId: id };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingSelect = (rating: number | null) => {
    const newFilters = { ...filters, minRating: rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleCategory = (id: number) => {
    const next = new Set(expandedCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCategories(next);
  };

  const resetFilters = () => {
    const initial = { categoryId: null, minPrice: '', maxPrice: '', brand: '', minRating: null };
    setFilters(initial);
    onFilterChange(initial);
  };

  const renderCategory = (category: any, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSub = category.subCategories && category.subCategories.length > 0;
    const isSelected = filters.categoryId === category.id;

    return (
      <div key={category.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
            isSelected ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20' : 'hover:bg-gray-100 text-gray-600'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => handleCategorySelect(category.id)}
        >
          <span className="text-sm truncate">{category.name}</span>
          {hasSub && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleCategory(category.id); }}
              className="p-1 hover:bg-black/5 rounded-md"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
        {hasSub && isExpanded && (
          <div className="space-y-1">
            {category.subCategories.map((sub: any) => renderCategory(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-80 space-y-10 shrink-0">
      <div className="flex items-center justify-between sticky top-24 bg-white/80 backdrop-blur-md z-10 py-2">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
          <Filter size={20} className="text-orange-500" /> Filters
        </h2>
        <button 
          onClick={resetFilters}
          className="text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-tighter"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Categories</h3>
        <div className="space-y-1">
          <div 
            onClick={() => handleCategorySelect(null)}
            className={`p-2 rounded-xl cursor-pointer text-sm transition-all ${
              filters.categoryId === null ? 'bg-orange-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            All Collections
          </div>
          {categories.map((cat) => renderCategory(cat))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Price Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400">MIN</span>
            <input 
              type="number" 
              placeholder="$0" 
              value={filters.minPrice}
              onChange={(e) => handlePriceChange(e, 'min')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-bold text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400">MAX</span>
            <input 
              type="number" 
              placeholder="$9,9k" 
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange(e, 'max')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div 
              key={rating}
              onClick={() => handleRatingSelect(rating)}
              className={`flex items-center gap-2 cursor-pointer p-2 rounded-xl transition-all ${
                filters.minRating === rating ? 'bg-gray-100 ring-1 ring-orange-500/20' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200'} />
                ))}
              </div>
              <span className={`text-xs font-bold ${filters.minRating === rating ? 'text-orange-500' : 'text-gray-400'}`}>
                {rating === 5 ? 'Elite' : `& Up`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Banner placeholder */}
      <div className="bg-black rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden group">
         <div className="relative z-10">
           <p className="text-orange-500 font-black text-[10px] tracking-widest uppercase">Member Exclusive</p>
           <h4 className="text-xl font-black">GET THE APP & SAVE 20%</h4>
           <button className="bg-white text-black text-[10px] font-black px-6 py-2 rounded-full mt-2 group-hover:bg-orange-500 group-hover:text-white transition-colors">DOWNLOAD</button>
         </div>
         <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full"></div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
