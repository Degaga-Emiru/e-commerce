'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, BarChart2, Store, Ticket, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
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
          <div className="hidden md:flex flex-1 mx-12 relative group">
            <input
              type="text"
              placeholder="Searching for excellence..."
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 pl-12 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
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
            <Link href={isAuthenticated ? "/profile" : "/login"} className="text-gray-700 hover:text-orange-500 transition-colors">
              <User size={24} />
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
