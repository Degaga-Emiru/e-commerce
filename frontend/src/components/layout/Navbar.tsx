'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Heart, BarChart2, Store, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import NotificationBell from './NotificationBell';
import AmazonSearchBar from './AmazonSearchBar';
import MegaMenu from './MegaMenu';
import DeliveryBar from './DeliveryBar';
import AmazonSidebar from './AmazonSidebar';
import CategoryNav from './CategoryNav';
import api from '@/services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [categories, setCategories] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        const data = res.data.categories || res.data.data || [];
        setCategories(data);
      } catch (e) {
        console.warn('Nav cats fetch fail');
      }
    };
    fetchCats();
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/verify-otp';

  if (isAuthPage) {
    return (
      <nav className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-6 flex justify-center">
          <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900">
            E<span className="text-orange-500">STORE</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
        {/* Main Header Row */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-8 md:gap-8 gap-4">
          
          <div className="flex items-center gap-4 shrink-0">
            {/* Hamburger - Mobile only */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1 -ml-1 text-gray-900 hover:text-orange-500 transition-colors"
            >
              <Menu size={28} />
            </button>
            
            {/* Logo */}
            <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900">
              E<span className="text-orange-500">STORE</span>
            </Link>
          </div>

          {/* Search Bar - Center (Desktop) */}
          <div className="hidden md:block flex-1 max-w-2xl">
            <AmazonSearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
             {!isLoading && isAuthenticated && (
              <>
                {user?.role === 'SELLER' && (
                  <Link href="/seller/dashboard" title="Seller Dashboard" className="hidden md:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-bold px-4 py-2 rounded-full border border-indigo-100">
                    <Store size={16} /> Seller Dashboard
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" title="Admin Dashboard" className="hidden md:flex items-center gap-1.5 bg-gray-900 text-white hover:bg-gray-800 transition-colors text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                    <BarChart2 size={16} /> Admin Panel
                  </Link>
                )}
              </>
            )}

            {!isLoading && (
              <Link href={isAuthenticated ? '/profile' : '/login'} className="hidden md:flex p-2 text-gray-700 hover:text-orange-500 transition-colors relative flex-col items-center">
                <User size={24} />
                <span className="hidden lg:block text-[10px] font-bold mt-1">Account</span>
              </Link>
            )}

            {!isLoading && isAuthenticated && (user?.role === 'CUSTOMER') && (
              <>
                <Link href="/wishlist" className="hidden md:flex p-2 text-gray-700 hover:text-orange-500 transition-colors relative flex-col items-center">
                  <div className="relative">
                    <Heart size={24} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-black">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-[10px] font-bold mt-1">Wishlist</span>
                </Link>

                <Link href="/cart" className="p-2 text-gray-900 hover:text-orange-500 transition-colors relative flex flex-col items-center group">
                  <div className="relative">
                    <ShoppingCart size={28} className="md:w-6 md:h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] rounded-full h-5 w-5 md:h-4 md:w-4 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-[10px] font-bold mt-1">Cart</span>
                </Link>
              </>
            )}

            {!isLoading && isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <Link 
                href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'} 
                className="p-2 text-gray-700 hover:text-orange-500 transition-colors relative flex flex-col items-center group"
                title="Go to Dashboard"
              >
                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                  {user?.role === 'ADMIN' ? <BarChart2 size={24} /> : <Store size={24} />}
                </div>
                <span className="hidden lg:block text-[10px] font-bold mt-1 uppercase tracking-tighter">Dashboard</span>
              </Link>
            )}

            {!isLoading && !isAuthenticated && (
              <>
                <Link href="/wishlist" className="hidden md:flex p-2 text-gray-700 hover:text-orange-500 transition-colors relative flex-col items-center">
                  <div className="relative">
                    <Heart size={24} />
                  </div>
                  <span className="hidden lg:block text-[10px] font-bold mt-1">Wishlist</span>
                </Link>

                <Link href="/cart" className="p-2 text-gray-900 hover:text-orange-500 transition-colors relative flex flex-col items-center group">
                  <div className="relative">
                    <ShoppingCart size={28} className="md:w-6 md:h-6" />
                  </div>
                  <span className="hidden lg:block text-[10px] font-bold mt-1">Cart</span>
                </Link>
              </>
            )}

            <div className="hidden md:block p-2">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile Fallback */}
        <div className="md:hidden w-full px-4 pb-3">
          <AmazonSearchBar />
        </div>

        {/* Secondary Navigation Row (MegaMenu & Links) - Desktop Only */}
        <div className="hidden md:block bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 flex items-center gap-6">
            <MegaMenu categories={categories} />
            <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-gray-600 overflow-x-auto whitespace-nowrap py-3 hide-scrollbar">
               <Link href="/products?sortBy=orders" className="hover:text-orange-500 transition-colors">Best Sellers</Link>
               <Link href="/new-user-deals" className="hover:text-orange-500 transition-colors">Today's Deals</Link>
               <Link href="/products?sortBy=createdAt" className="hover:text-orange-500 transition-colors">New Releases</Link>
               <Link href="/products?filter=recommended" className="hover:text-orange-500 transition-colors">Recommended</Link>
               <Link href="/contact" className="hover:text-orange-500 transition-colors">Customer Service</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Horizontal Category Scrolling Row */}
      <div className="md:hidden sticky top-[108px] sm:top-[124px] z-40 bg-white shadow-sm border-b border-gray-100">
        <CategoryNav categories={categories} />
      </div>

      <div className="md:hidden">
        <DeliveryBar />
      </div>
      <div className="hidden sm:block md:block">
           <DeliveryBar />
      </div>

      <AmazonSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
      />
    </>
  );
};

export default Navbar;

