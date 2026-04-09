'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/util/imageUtils';
import { toast } from 'react-hot-toast';

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    averageRating?: number;
    reviewsCount?: number;
  };
}

const AmazonProductCard: React.FC<ProductProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isWishlisting, setIsWishlisting] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisting(true);
    await toggleWishlist(product.id);
    setIsWishlisting(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.imageUrl,
      quantity: 1
    });
    toast.success('Added to cart');
  };

  return (
    <Link 
      href={`/product/${product.id}`}
      className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative w-full h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-2">
        <img 
          src={getImageUrl(product.imageUrl)} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Wishlist Toggle */}
        <button 
          onClick={handleWishlist}
          disabled={isWishlisting}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md backdrop-blur-md transition-all ${
            inWishlist ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-400 hover:text-rose-500'
          }`}
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} className={isWishlisting ? 'animate-pulse' : ''} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
            -{discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < Math.floor(product.averageRating || 0) ? "currentColor" : "none"} 
                className={i < Math.floor(product.averageRating || 0) ? "" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400">({product.reviewsCount || 0})</span>
        </div>

        {/* Price Section */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-[10px] text-gray-400 line-through font-medium">ETB {product.price.toLocaleString()}</span>
                <span className="text-lg font-black text-gray-900 leading-none">ETB {product.discountPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-lg font-black text-gray-900 leading-none">ETB {product.price.toLocaleString()}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors active:scale-90"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AmazonProductCard;
