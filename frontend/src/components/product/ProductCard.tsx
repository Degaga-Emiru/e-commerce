'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string;
  averageRating?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      quantity: 1,
      image: product.imageUrl
    });
    toast.success('Added to cart!');
  };

  const displayPrice = typeof product.price === 'number' 
    ? product.price.toFixed(2) 
    : parseFloat(product.price || '0').toFixed(2);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
              No Preview
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500"></div>

          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-orange-500 text-white p-4 rounded-2xl shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-600 active:scale-95"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < (product.averageRating || 4) ? "text-orange-500 fill-orange-500" : "text-gray-200"}
              />
            ))}
          </div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-orange-600 font-extrabold text-lg">${displayPrice}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
