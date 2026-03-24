'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { CreditCard, Truck, ShieldCheck, ChevronRight, MapPin, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data);
        if (res.data.length > 0) {
          setSelectedAddressId(res.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        toast.error('Could not load your saved addresses');
      } finally {
        setFetchingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setLoading(true);
    try {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddr) throw new Error('Selected address not found');

      // 1. Create Order
      const orderRequest = {
        userId: user?.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          addressId: selectedAddr.id,
          recipientName: `${user?.firstName} ${user?.lastName}`,
          street: selectedAddr.street,
          city: selectedAddr.city,
          state: selectedAddr.state,
        zipCode: selectedAddr.zipCode,
          country: selectedAddr.country,
          phoneNumber: selectedAddr.phoneNumber
        }
      };

      const orderResponse = await api.post('/orders', orderRequest);
      const orderData = orderResponse.data.data;
      const orderId = orderData.id;

      // 2. Initialize Payment
      const paymentResponse = await api.post('/payments/initialize', {
        orderId: orderId,
        paymentMethod: 'CHAPA',
        amount: cartTotal,
        accountNumber: 'N/A', // Chapa handles this
        routingNumber: 'N/A'
      });

      if (paymentResponse.data.checkoutUrl) {
        toast.success('Order created! Redirecting to Chapa...');
        // Clear cart before redirecting
        clearCart();
        window.location.href = paymentResponse.data.checkoutUrl;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <span className="text-orange-500 font-bold">Checkout</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">Shipping</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">Payment</span>
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center text-gray-900">
                <MapPin size={24} className="mr-3 text-orange-500" />
                Shipping Address
              </h2>
              <Link href="/profile" className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:underline">
                <Plus size={16} /> Manage Addresses
              </Link>
            </div>

            {fetchingAddresses ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-6 bg-white rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedAddressId === addr.id 
                      ? 'border-orange-500 shadow-lg shadow-orange-500/10' 
                      : 'border-gray-100 hover:border-orange-200'
                    }`}
                  >
                    <div className="pr-8">
                      <p className="font-bold text-gray-900">{addr.street}</p>
                      <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">{addr.country}</p>
                      <p className="text-gray-400 text-xs mt-1">{addr.phoneNumber}</p>
                    </div>
                    {selectedAddressId === addr.id && (
                      <div className="absolute top-4 right-4 text-orange-500">
                        <ShieldCheck size={24} fill="currentColor" className="text-orange-100" />
                        <ShieldCheck size={24} className="absolute inset-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">You don't have any saved addresses.</p>
                <Link href="/profile" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold inline-block shadow-lg shadow-orange-500/20">
                  Add an Address
                </Link>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-900">
              <CreditCard size={24} className="mr-3 text-orange-500" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
              <label className="relative flex items-center p-6 border-2 border-orange-500 rounded-2xl bg-orange-50/50 cursor-pointer shadow-sm">
                <input type="radio" name="payment" checked className="hidden" readOnly />
                <div className="flex items-center">
                  <div className="w-14 h-9 bg-black rounded-lg flex items-center justify-center mr-4 shadow-md">
                    <span className="text-white font-black text-[10px] tracking-tighter italic">CHAPA</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Chapa Payment</span>
                    <span className="text-gray-500 text-xs">Debit/Credit Card, Telebirr, CBEBirr</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-orange-500">
                  <ShieldCheck size={20} />
                </div>
              </label>
              
              <div className="flex items-center p-6 border-2 border-gray-50 rounded-2xl cursor-not-allowed opacity-40 bg-gray-50">
                <div className="flex items-center">
                  <div className="w-14 h-9 bg-gray-200 rounded-lg mr-4"></div>
                  <div>
                    <span className="font-bold text-gray-400 block">Other Methods</span>
                    <span className="text-gray-400 text-xs">Available soon</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-black mb-8 text-gray-900 tracking-tight">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name} <span className="text-gray-400 font-bold ml-1">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-900">ETB {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">ETB {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Shipping</span>
                  <span className="text-green-600 font-black">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-900 font-black text-xl tracking-tight">TOTAL</span>
                  <span className="text-orange-500 font-black text-3xl tracking-tighter">ETB {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={loading || fetchingAddresses || addresses.length === 0}
              className="w-full bg-orange-500 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-600 transition-all transform active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Processing...</span>
                </>
              ) : (
                'Place Order Now'
              )}
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-green-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Secure & Encrypted Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
