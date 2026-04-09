'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, BarChart2, Store, Ticket, Sparkles, Heart, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import NotificationBell from './NotificationBell';
import { getImageUrl } from '@/util/imageUtils';

import { useRouter } from 'next/navigation';
import { searchApi } from '@/services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const fetchHistory = async () => {
    if (isAuthenticated) {
      try {
        const response = await searchApi.getHistory();
        setHistory(response.data.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching search history:', error);
      }
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/verify-otp';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 group">
          E<span className="text-orange-500 group-hover:text-gray-900 transition-colors">STORE</span>
        </Link>

        {/* Search Bar */}
        {!isAuthPage && (
          <div ref={searchRef} className="hidden md:flex flex-1 mx-12 relative group">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Searching for excellence..."
                value={searchQuery}
                onFocus={() => {
                  setShowSuggestions(true);
                  fetchHistory();
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 pl-12 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400 text-gray-900"
              />
              <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (history.length > 0 || searchQuery.length > 2) && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                {history.length > 0 && (
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-3 px-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Searches</span>
                       <button 
                         onClick={async () => {
                           await searchApi.clearHistory();
                           setHistory([]);
                         }}
                         className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
                       >
                         Clear
                       </button>
                    </div>
                    <div className="space-y-1">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setSearchQuery(item.query);
                            router.push(`/search?q=${encodeURIComponent(item.query)}`);
                            setShowSuggestions(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
                        >
                          <Search size={14} className="text-gray-300" />
                          <span className="text-sm font-medium">{item.query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchQuery.length > 2 && (
                  <div className="p-4 bg-gray-50/50">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-2">Quick Results</span>
                     <div 
                       onClick={handleSearch}
                       className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer text-gray-900 transition-all font-bold"
                     >
                       <Zap size={14} className="text-orange-500" />
                       <span className="text-sm italic">Search for "{searchQuery}"</span>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Role-specific dashboard links */}
          {!isLoading && isAuthenticated && (
            <>
              {user?.role === 'SELLER' && (
                <Link href="/seller/dashboard" title="Seller Dashboard"
                  className="hidden md:flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-semibold">
                  <Store size={18} /> Shop
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin/dashboard" title="Admin Dashboard"
                  className="hidden md:flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-semibold">
                  <BarChart2 size={18} /> Admin
                </Link>
              )}
            </>
          )}

          {user?.role === 'CUSTOMER' && (
            <div className="flex items-center space-x-4">
              {user.isNewUser && (
                <Link href="/new-user-deals" className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform" title="New User Deals">
                  <Sparkles size={14} /> New User Deals
                </Link>
              )}
                <Link href="/wishlist" className="relative text-gray-700 hover:text-orange-500 transition-colors" title="My Wishlist">
                  <Heart size={24} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-black">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile/coupons" className="text-gray-700 hover:text-orange-500 transition-colors relative group" title="My Coupons">
                <Ticket size={24} />
                {user.isNewUser && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </Link>
            </div>
          )}

          {user?.role !== 'ADMIN' && (
            <Link href="/cart" className="relative text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <NotificationBell />

          {!isLoading && (
            <Link
              href={isAuthenticated ? '/profile' : '/login'}
              className="flex-shrink-0 focus:outline-none"
              title={isAuthenticated ? `${user?.firstName} ${user?.lastName}` : 'Login'}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-orange-500/30 hover:ring-orange-500 transition-all shadow-md flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600">
                {isAuthenticated && user?.profilePictureUrl ? (
                  <img
                    src={getImageUrl(user.profilePictureUrl)}
                    alt={user.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : isAuthenticated ? (
                  <span className="text-white font-black text-xs uppercase">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
            </Link>
          )}

          <button className="md:hidden text-gray-700">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
