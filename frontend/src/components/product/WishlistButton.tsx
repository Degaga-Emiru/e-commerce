'use client';

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { wishlistApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
  productId: number;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { items, refreshWishlist } = useWishlist();
  
  const isWishlisted = items.some(item => item.product.id === productId);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist(productId);
        toast.success('Added to wishlist');
      }
      // Refresh global count/items
      await refreshWishlist();
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg ${
        isWishlisted 
          ? 'bg-rose-500 text-white hover:bg-rose-600' 
          : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:scale-110'}`}
    >
      {isLoading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
      )}
    </button>
  );
};

export default WishlistButton;
