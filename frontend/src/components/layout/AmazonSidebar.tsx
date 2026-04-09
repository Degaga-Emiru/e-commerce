'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Home, TrendingUp, Heart, Ticket, ShoppingBag, Settings, LogOut, ChevronRight, Search, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/util/imageUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
}

const AmazonSidebar: React.FC<Props> = ({ isOpen, onClose, categories }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const menuItems = [
    { icon: <Home size={22} />, label: 'Home', href: '/' },
    { icon: <Search size={22} />, label: 'Shop All Products', href: '/products' },
    { icon: <TrendingUp size={22} />, label: 'Trending', href: '/products?sortBy=rating' },
    { icon: <Heart size={22} />, label: 'Wishlist', href: '/wishlist' },
    { icon: <ShoppingCart size={22} />, label: 'Cart', href: '/cart', count: cartCount },
    { icon: <ShoppingBag size={22} />, label: 'My Orders', href: '/profile/orders' },
    { icon: <Ticket size={22} />, label: 'Coupons & Offers', href: '/profile/coupons' },
    { icon: <Settings size={22} />, label: 'Settings', href: '/profile/settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[201] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header / User Profile */}
            <div className="bg-gray-900 text-white p-8 pb-10 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mt-4">
                <div className="w-14 h-14 rounded-full border-2 border-orange-500 overflow-hidden bg-gray-800 flex items-center justify-center shrink-0">
                  {isAuthenticated && user?.profilePictureUrl ? (
                    <img src={getImageUrl(user.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight line-clamp-1">
                    {isAuthenticated ? `Hello, ${user?.firstName}` : 'Hello, Sign in'}
                  </h3>
                  {!isAuthenticated ? (
                    <Link href="/login" onClick={onClose} className="text-orange-500 text-xs font-black uppercase tracking-widest hover:underline">Start your journey</Link>
                  ) : (
                    <Link href="/profile" onClick={onClose} className="text-gray-400 text-xs font-medium hover:text-white">View Account Settings</Link>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
              {/* Search Bar inside Sidebar */}
              <div className="px-4 mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text"
                    placeholder="Search Pulse..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-12 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none font-bold text-sm"
                  />
                  <Search size={20} className="absolute left-4 top-4 text-gray-400" />
                </form>
              </div>

              <div className="space-y-1 px-4 mb-10 text-gray-900">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4 font-mono">Marketplace Tools</h4>
                {menuItems.map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 text-gray-900 font-bold transition-all group"
                  >
                    <span className="text-gray-400 group-hover:text-orange-500 transition-colors">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black min-w-[20px] text-center">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-100 group-hover:text-gray-300 transition-colors" />
                  </Link>
                ))}
              </div>

              <div className="space-y-1 px-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4 font-mono">Top Collections</h4>
                {categories.slice(0, 10).map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 rounded-xl group transition-all"
                  >
                    <span className="text-sm font-bold text-gray-600 group-hover:text-orange-600 truncate mr-4 italic">
                      {cat.name}
                    </span>
                    <ChevronRight size={14} className="text-gray-200 group-hover:text-orange-300" />
                  </Link>
                ))}
                <Link 
                  href="/products" 
                  onClick={onClose}
                  className="block px-4 py-4 mt-2 text-orange-500 text-xs font-black uppercase tracking-widest text-center border-t border-gray-50"
                >
                  View All Categories
                </Link>
              </div>
            </div>

            {/* Footer / Account Management */}
            <div className="p-6 border-t border-gray-100 italic space-y-3">
              {isAuthenticated ? (
                <button 
                  onClick={() => { logout(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <LogOut size={16} /> Secure Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={onClose} className="bg-orange-500 text-white py-4 rounded-xl font-black text-xs text-center shadow-lg shadow-orange-500/20 uppercase tracking-widest">Sign In</Link>
                  <Link href="/register" onClick={onClose} className="bg-gray-900 text-white py-4 rounded-xl font-black text-xs text-center uppercase tracking-widest">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AmazonSidebar;
