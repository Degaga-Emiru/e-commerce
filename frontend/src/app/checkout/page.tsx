'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { CreditCard, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CheckoutPage = () => {
  const { cartTotal, cartCount, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      toast.success('Order placed successfully! Redirecting to payment...');
      // Logic for Chapa redirect would go here
    }, 2000);
  };

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">No items to checkout</h1>
        <Link href="/products" className="bg-orange-500 text-white px-8 py-3 rounded-md font-bold">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Form */}
        <div className="lg:w-2/3 space-y-12">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className={step >= 1 ? "text-orange-500" : "text-gray-400"}>Shipping</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className={step >= 2 ? "text-orange-500" : "text-gray-400"}>Payment</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className={step >= 3 ? "text-orange-500" : "text-gray-400"}>Review</span>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Truck size={24} className="mr-3 text-orange-500" />
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-orange-500" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-orange-500" placeholder="+251 912 345 678" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Address Line</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-orange-500" placeholder="123 Street Name, Addis Ababa" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <CreditCard size={24} className="mr-3 text-orange-500" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border border-orange-500 rounded-xl bg-orange-50 cursor-pointer">
                <input type="radio" name="payment" checked className="hidden" readOnly />
                <div className="flex items-center">
                  <div className="w-12 h-8 bg-black rounded flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xs italic">CHAPA</span>
                  </div>
                  <span className="font-bold">Chapa Payment</span>
                </div>
                <div className="absolute top-2 right-2 text-orange-500">
                  <ShieldCheck size={20} />
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-not-allowed opacity-50">
                <div className="flex items-center">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center mr-4"></div>
                  <span className="font-medium text-gray-400">Other (Coming Soon)</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 bg-white p-8 rounded-2xl border-2 border-orange-500 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Confirm Order</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Subtotal</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-black text-2xl">
                <span>TOTAL</span>
                <span className="text-orange-500">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-md font-bold text-lg hover:bg-orange-600 transition-all transform active:scale-95 disabled:bg-gray-400 shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Processing...' : 'Place Order Now'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Secure payment powered by Chapa API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
