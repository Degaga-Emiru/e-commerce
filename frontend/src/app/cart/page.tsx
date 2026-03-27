'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          href="/products" 
          className="bg-orange-500 text-white px-8 py-3 rounded-md font-bold hover:bg-orange-600 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-6">
          {cart.map((item) => (
            <div key={`${item.productId}-${item.variantId || 'base'}`} className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  {(item.size || item.color) && (
                    <p className="text-gray-500 text-sm">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span className="mx-2">|</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </p>
                  )}
                  <p className="text-orange-600 font-bold">${item.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                    className="p-2 hover:text-orange-500"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="p-2 hover:text-orange-500"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId, item.variantId)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <Link href="/products" className="inline-flex items-center text-orange-500 font-semibold hover:underline mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-orange-500">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link 
              href="/checkout"
              className="block w-full bg-orange-500 text-white text-center py-4 rounded-md font-bold hover:bg-orange-600 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
