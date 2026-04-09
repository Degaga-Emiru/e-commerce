'use client';

import React, { useState } from 'react';
import { Search, Camera, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AmazonSearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full px-4 py-3 bg-white">
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          placeholder="Search items, shops, and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 bg-gray-100 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl pl-14 pr-16 outline-none transition-all font-bold text-gray-900 shadow-sm"
        />
        
        {/* Left Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
          <Search size={22} />
        </div>

        {/* Right Icons (Amazon style) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
           <button type="button" className="p-2 text-gray-400 hover:text-orange-500 transition-colors hidden sm:block">
             <Camera size={20} />
           </button>
           <button type="submit" className="bg-orange-500 text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95">
             <Search size={20} />
           </button>
        </div>
      </form>
    </div>
  );
};

export default AmazonSearchBar;
