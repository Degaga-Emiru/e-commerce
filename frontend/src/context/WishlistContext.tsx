'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
  items: any[];
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();

  const refreshWishlist = async () => {
    if (isAuthenticated) {
      try {
        const response = await wishlistApi.getWishlist();
        const wishlistItems = response.data.data.items || [];
        setWishlistCount(wishlistItems.length);
        setItems(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    } else {
      setWishlistCount(0);
      setItems([]);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist, items }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
