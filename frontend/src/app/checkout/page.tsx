'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { CreditCard, Truck, ShieldCheck, ChevronRight, MapPin, Loader2, Plus, Ticket } from 'lucide-react';
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
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const isNewUser = user?.isNewUser;

  // Auto-fill coupon for new users
  useEffect(() => {
    if (isNewUser && !couponApplied) {
      setCouponCode('WELCOME10');
      const disc = cartTotal * 0.1;
      setDiscount(disc);
      setCouponApplied(true);
    }
  }, [isNewUser, cartTotal]);

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
          variantId: item.variantId,
          quantity: item.quantity
        })),
        couponCode: couponApplied ? couponCode : undefined,
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
          {/* Breadcrumbs / Steps */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/cart')}>
               <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">1</div>
               <span className="text-sm font-black text-orange-500 uppercase tracking-widest">Cart</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-500/20">2</div>
               <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Review & Pay</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className="flex items-center gap-2 opacity-30">
               <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-black text-xs">3</div>
               <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Success</span>
            </div>
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
            
            <div className="space-y-6 mb-10">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'base'}`} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         {item.quantity} × ETB {item.price.toLocaleString()}
                       </span>
                       <span className="text-sm font-black text-gray-900">ETB {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {(item.size || item.color) && (
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">
                        {item.size} {item.size && item.color && '/'} {item.color}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-50 space-y-4">
                {/* Coupon Code Section */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setDiscount(0); }}
                        placeholder="Enter code" 
                        className="w-full pl-9 pr-3 py-3 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500 text-gray-900"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!couponCode) return;
                        // Simple client-side validation for WELCOME10
                        if (couponCode === 'WELCOME10' && isNewUser) {
                          setDiscount(cartTotal * 0.1);
                          setCouponApplied(true);
                          toast.success('🎉 New user discount applied!');
                        } else if (couponCode === 'WELCOME10' && !isNewUser) {
                          toast.error('This coupon is for new users only');
                        } else {
                          toast.error('Invalid coupon code');
                        }
                      }}
                      className="bg-orange-500 text-white px-4 py-3 rounded-xl text-sm font-black hover:bg-orange-600 transition-all shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                      ✅ New user discount applied successfully 🎉
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">ETB {cartTotal.toLocaleString()}</span>
                </div>
                {couponApplied && discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Discount (-10%)</span>
                    <span className="font-bold">-ETB {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Shipping</span>
                  <span className="text-green-600 font-black">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-900 font-black text-xl tracking-tight">TOTAL</span>
                  <span className="text-orange-500 font-black text-3xl tracking-tighter">ETB {(cartTotal - discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
