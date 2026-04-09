'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MegaMenuProps {
  categories: any[];
}

const MegaMenu: React.FC<MegaMenuProps> = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors">
        <Menu size={20} />
        <span className="hidden md:inline">All Categories</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-[800px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 p-6"
          >
            <div className="grid grid-cols-3 gap-8">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <Link
                      href={`/products?category=${category.name}`}
                      className="text-lg font-black text-gray-900 hover:text-orange-500 transition-colors inline-block pb-2 border-b-2 border-transparent hover:border-orange-500"
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ul className="space-y-2">
                        {category.subcategories.map((sub: any) => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?category=${category.name}&sub=${sub.name}`}
                              className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors flex items-center justify-between group/item"
                            >
                              {sub.name}
                              <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center text-gray-400 font-medium">
                  Categories loading...
                </div>
              )}
              
              {/* Optional Promotional block inside MegaMenu */}
              <div className="col-span-3 mt-4 pt-6 border-t border-gray-100 flex items-center justify-between">
                 <p className="text-sm font-bold text-gray-800">Looking for something specific?</p>
                 <Link href="/products" className="text-sm font-black text-orange-500 hover:underline">View All Collections &rarr;</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenu;
