'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, BarChart2, Store, Ticket, Sparkles, Heart, Zap, Loader2, X, ChevronRight, LogOut, Bell } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import NotificationBell from './NotificationBell';
import { getImageUrl } from '@/util/imageUtils';

import { useRouter } from 'next/navigation';
import { searchApi, categoryApi } from '@/services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [liveSuggestions, setLiveSuggestions] = React.useState<{ products: any[], categories: any[] }>({ products: [], categories: [] });
  const [fetchingSuggestions, setFetchingSuggestions] = React.useState(false);
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
        // Backend returns ApiResponse<List<SearchHistoryDto>>, so we access .data.data
        const historyData = response.data.data || [];
        setHistory(Array.isArray(historyData) ? historyData.slice(0, 5) : []);
      } catch (error) {
        console.error('Error fetching search history:', error);
      }
    }
  };

  React.useEffect(() => {
    fetchHistory();
    fetchCategories();
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = res.data.categories || res.data.data || (Array.isArray(res.data) ? res.data : []);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to fetch navbar categories');
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

  // Close menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    // Dynamic Real-Time Search Redirect
    if (searchQuery.trim().length > 0) {
      const isSearchPage = pathname === '/search' || pathname === '/products';
      
      const timeoutId = setTimeout(() => {
        if (!isSearchPage) {
          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
          // If already on search/products page, update the URL query param
          const params = new URLSearchParams(window.location.search);
          params.set('q', searchQuery.trim());
          router.replace(`${pathname}?${params.toString()}`);
        }
      }, 400); // 400ms debounce for redirect

      return () => clearTimeout(timeoutId);
    } else if (searchQuery === '' && (pathname === '/search' || pathname === '/products')) {
      // Auto-Reset behavior: If input is cleared, remove the query param
      router.replace(pathname);
    }
  }, [searchQuery, pathname, router]);

  React.useEffect(() => {
    if (searchQuery.length < 1) {
      setLiveSuggestions({ products: [], categories: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setFetchingSuggestions(true);
      try {
        const res = await searchApi.getSuggestions(searchQuery);
        if (res.data.success) {
          setLiveSuggestions(res.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setFetchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  
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
                
                {searchQuery.length > 1 && (
                  <div className="p-4 bg-gray-50/50 space-y-4">
                     {/* Category Suggestions */}
                     {liveSuggestions.categories.length > 0 && (
                       <div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Top Categories</span>
                         <div className="space-y-1">
                           {liveSuggestions.categories.map((cat: any) => (
                             <div 
                               key={cat.id}
                               onClick={() => {
                                 router.push(`/products?categoryId=${cat.id}`);
                                 setShowSuggestions(false);
                               }}
                               className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer text-gray-900 transition-all"
                             >
                               <Menu size={14} className="text-orange-500" />
                               <span className="text-sm font-bold">{cat.name}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Product Suggestions */}
                     {liveSuggestions.products.length > 0 && (
                       <div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Products</span>
                         <div className="space-y-1">
                           {liveSuggestions.products.map((prod: any) => (
                             <div 
                               key={prod.id}
                               onClick={() => {
                                 router.push(`/product/${prod.id}`);
                                 setShowSuggestions(false);
                               }}
                               className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer text-gray-900 transition-all"
                             >
                               <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1">
                                 {prod.imageUrl ? (
                                   <img src={getImageUrl(prod.imageUrl)} alt="" className="w-full h-full object-contain" />
                                 ) : (
                                   <Sparkles size={12} className="text-orange-400" />
                                 )}
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-sm font-bold line-clamp-1">{prod.name}</span>
                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">${prod.price}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     <div 
                       onClick={handleSearch}
                       className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer text-gray-900 transition-all font-bold border-t border-gray-100 pt-4"
                     >
                       <Zap size={14} className="text-orange-500" />
                       <span className="text-sm italic">Search for "{searchQuery}"</span>
                       {fetchingSuggestions && <Loader2 size={14} className="animate-spin ml-auto text-gray-300" />}
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

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-xl"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-[100] md:hidden">
          {/* Blur Overlay */}
          <div 
            className="absolute inset-0 bg-white/60 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white border-l border-gray-100 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            {/* User Info / Auth */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
              {isAuthenticated ? (
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                      {user?.profilePictureUrl ? (
                        <img src={getImageUrl(user.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-black text-lg">
                           {user?.firstName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-lg leading-tight">{user?.firstName} {user?.lastName}</h4>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{user?.role} Pulse Member</p>
                    </div>
                 </div>
              ) : (
                <div className="flex flex-col gap-3">
                   <h4 className="font-black text-gray-900 text-lg">Experience Excellence</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <Link href="/login" className="bg-orange-500 text-white py-3 rounded-xl font-black text-xs text-center shadow-lg shadow-orange-500/20 uppercase tracking-widest">Login</Link>
                      <Link href="/register" className="bg-gray-900 text-white py-3 rounded-xl font-black text-xs text-center uppercase tracking-widest">Sign Up</Link>
                   </div>
                </div>
              )}
            </div>

            {/* Mobile Search */}
            <div className="p-6 border-b border-gray-50">
               <form onSubmit={handleSearch} className="relative">
                 <input 
                   type="text" 
                   placeholder="Searching catalog..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-gray-50 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none font-bold"
                 />
                 <Search size={20} className="absolute left-4 top-4 text-gray-400" />
               </form>
            </div>

            {/* Quick Actions */}
            <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-50">
               {[
                 { icon: <ShoppingCart />, label: 'Cart', count: cartCount, href: '/cart' },
                 { icon: <Heart />, label: 'Wishlist', count: wishlistCount, href: '/wishlist' },
                 { icon: <Bell />, label: 'Alerts', count: 0, href: '/notifications' }
               ].map((action, idx) => (
                 <Link key={idx} href={action.href} className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 bg-gray-50 rounded-[1.25rem] flex items-center justify-center text-gray-600 group-hover:bg-orange-500 group-hover:text-white transition-all relative">
                      {action.icon}
                      {action.count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                          {action.count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{action.label}</span>
                 </Link>
               ))}
            </div>

            {/* Categories Menu */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
               <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Collections</h5>
               <div className="space-y-1">
                 {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/products?categoryId=${cat.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-all font-bold"
                    >
                      <span className="text-sm">{cat.name}</span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                 ))}
               </div>
            </div>

            {/* Bottom Actions */}
            {isAuthenticated && (
              <div className="p-8 border-t border-gray-50">
                <button 
                  onClick={() => { logout(); router.push('/'); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 text-rose-500 font-black uppercase text-xs tracking-widest hover:bg-rose-50 py-4 rounded-2xl transition-all"
                >
                  <LogOut size={16} /> Secure Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
