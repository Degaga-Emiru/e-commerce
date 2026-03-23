'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Mock fetch product details
    setProduct({
      id: Number(id),
      title: 'Premium Wireless Headphones',
      price: 199.99,
      description: 'Experience high-fidelity audio with these premium wireless headphones. Featuring active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions.',
      category: 'Electronics',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      specs: [
        { name: 'Bluetooth', value: '5.0' },
        { name: 'Battery', value: '40 Hours' },
        { name: 'Weight', value: '250g' },
        { name: 'Colors', value: 'Space Gray, Silver, Black' }
      ]
    });
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.title,
      price: product.price,
      quantity: quantity,
      image: product.image
    });
    toast.success(`${quantity} item(s) added to cart!`);
  };

  if (!product) return <div className="p-20 text-center">Loading product...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Gallery */}
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="lg:w-1/2 space-y-8">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">{product.category}</span>
            <h1 className="text-4xl font-bold mt-2 text-gray-900">{product.title}</h1>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center text-orange-500">
                <Star size={18} className="fill-orange-500" />
                <span className="ml-1 font-bold">{product.rating}</span>
              </div>
              <span className="text-gray-400">({product.reviews} reviews)</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-orange-600">${product.price.toFixed(2)}</div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-orange-500"><Minus size={18} /></button>
                <span className="px-6 font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-orange-500"><Plus size={18} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-orange-500 text-white py-4 rounded-md font-bold flex items-center justify-center space-x-3 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Truck size={20} className="text-orange-500" />
              <span>Free Global Shipping</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ShieldCheck size={20} className="text-orange-500" />
              <span>2 Year Warranty</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <RefreshCw size={20} className="text-orange-500" />
              <span>30 Days Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-8">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {product.specs && product.specs.map((spec: any) => (
            <div key={spec.name} className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-500 font-medium">{spec.name}</span>
              <span className="text-gray-900 font-semibold">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
