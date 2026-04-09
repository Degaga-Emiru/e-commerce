'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Laptop, Disc, ShoppingBag, Dumbbell, Home, HeartPulse, Baby, Gem, Briefcase, Car, Stethoscope, Eraser, Sofa, Apple, Book } from 'lucide-react';

const CategoryNav = ({ categories }: { categories: any[] }) => {
  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      'Electronics': <Laptop size={18} />,
      'Clothing': <Disc size={18} />,
      'Shoes': <ShoppingBag size={18} />,
      'Sports': <Dumbbell size={18} />,
      'Home & Kitchen': <Home size={18} />,
      'Beauty & Personal Care': <HeartPulse size={18} />,
      'Toys & Kids': <Baby size={18} />,
      'Jewelry & Accessories': <Gem size={18} />,
      'Bags & Luggage': <Briefcase size={18} />,
      'Automotive': <Car size={18} />,
      'Health & Medical': <Stethoscope size={18} />,
      'Office Supplies': <Eraser size={18} />,
      'Furniture': <Sofa size={18} />,
      'Groceries': <Apple size={18} />,
      'Books': <Book size={18} />
    };
    return icons[name] || <Sparkles size={18} />;
  };

  return (
    <div className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide flex items-center px-4 py-3 gap-6 sticky top-[152px] z-40 shadow-sm">
      <Link href="/new-user-deals" className="flex flex-col items-center gap-1 shrink-0 group">
        <div className="w-12 h-12 bg-orange-100/50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
          <Sparkles size={18} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-900">Deals</span>
      </Link>

      {categories.map((cat) => (
        <Link 
          key={cat.id} 
          href={`/products?categoryId=${cat.id}`}
          className="flex flex-col items-center gap-1 shrink-0 group"
        >
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
            {getIcon(cat.name)}
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-gray-900 truncate max-w-[60px]">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryNav;
