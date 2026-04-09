'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
  items: any[];
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
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
        // Assuming backend returns { success: true, data: { items: [...] } }
        const wishlistItems = response.data.data?.items || response.data.data || [];
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

  const isInWishlist = (productId: number) => {
    return items.some(item => (item.id === productId || item.productId === productId));
  };

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) return;

    try {
      if (isInWishlist(productId)) {
        await wishlistApi.removeFromWishlist(productId);
      } else {
        await wishlistApi.addToWishlist(productId);
      }
      await refreshWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist, items, toggleWishlist, isInWishlist }}>
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
