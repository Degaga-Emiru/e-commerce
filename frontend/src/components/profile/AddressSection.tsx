'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, X, Check, Loader2, RotateCcw } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

const AddressSection = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderAddresses, setOrderAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/admin/orders' : '/orders/my-orders';
      const [addrRes, orderRes] = await Promise.allSettled([
        api.get('/addresses'),
        api.get(endpoint)
      ]);

      if (addrRes.status === 'fulfilled') {
        setAddresses(addrRes.value.data || []);
      }

      if (orderRes.status === 'fulfilled') {
        const rawData = orderRes.value.data;
        const orders = rawData.data || rawData.orders || rawData.result || [];
        const extracted: Address[] = [];
        const seen = new Set();

        orders.forEach((o: any) => {
          // Try to get snapshot fields first (Admins have these now)
          const sa = o.shippingStreet ? {
            street: o.shippingStreet,
            city: o.shippingCity,
            state: o.shippingState,
            zipCode: o.shippingZipCode,
            country: o.shippingCountry,
            phoneNumber: o.shippingPhoneNumber
          } : (o.shippingAddress || o.address);

          if (sa && sa.street) {
            const key = `${sa.street}-${sa.zipCode}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              extracted.push({
                id: Math.random(), 
                ...sa
              });
            }
          }
        });
        setOrderAddresses(extracted);
      }
    } catch (error) {
      console.error('Failed to fetch address data:', error);
      toast.error('Could not load address history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', formData);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phoneNumber: address.phoneNumber
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (id < 1) return; 
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="space-y-12">
      {/* Primary Account Address - HIDDEN FOR ADMIN */}
      {user?.address && !isAdmin && (
        <section className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Check size={22} className="text-blue-500" />
            Primary Account Address
          </h2>
          <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="font-black text-gray-900 text-xl mb-1">{user.address.street}</p>
                <p className="text-gray-500 font-medium">
                  {user.address.city}, {user.address.state} {user.address.zipCode}<br/>
                  <span className="text-blue-600 uppercase text-[10px] font-black tracking-[0.2em]">{user.address.country}</span>
                </p>
                {user.phoneNumber && (
                  <p className="text-xs text-blue-500 font-black mt-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                    {user.phoneNumber}
                  </p>
                )}
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verified Account Address</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Shipping History (Order Addresses) */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <RotateCcw size={22} className="text-emerald-500" />
          {isAdmin ? 'Platform Customer Shipping Summary' : 'Recent Shipping Locations'}
        </h2>
        <p className="text-sm text-gray-500 font-medium -mt-4">
          {isAdmin 
            ? 'A consolidated view of shipping addresses used by customers in platform orders.'
            : "Addresses used in your previous orders."
          }
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl"></div>)
          ) : orderAddresses.length > 0 ? (
            orderAddresses.map((addr) => (
              <div key={addr.id} className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 shadow-sm relative group hover:bg-white hover:border-emerald-200 transition-all">
                <MapPin size={16} className="text-emerald-400 absolute top-5 right-5 group-hover:text-emerald-500 transition-colors" />
                <p className="font-black text-gray-800 text-sm mb-1">{addr.street}</p>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {addr.city}, {addr.state} {addr.zipCode}<br/>
                  <span className="text-gray-400 uppercase tracking-wider">{addr.country}</span>
                </p>
                {addr.phoneNumber && (
                   <p className="text-[10px] text-emerald-600 font-black mt-3 flex items-center gap-1">
                     <span className="w-1 h-1 bg-emerald-300 rounded-full"></span>
                     {addr.phoneNumber}
                   </p>
                )}
              </div>
            ))
          ) : (
            <div className="md:col-span-3 py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
               <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No order address history found</p>
            </div>
          )}
        </div>
      </section>

      {/* Saved Addresses (Manual Management) - HIDDEN FOR ADMIN */}
      {!isAdmin && (
        <section className="space-y-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Plus size={22} className="text-orange-500" />
              Address Book
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <Plus size={16} />
                Add New
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border-2 border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Street Address</label>
                  <input
                    required type="text" value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">City</label>
                  <input
                    required type="text" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">State / Province</label>
                  <input
                    required type="text" value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Zip / Postal Code</label>
                  <input
                    required type="text" value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Country</label>
                  <input
                    required type="text" value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                  <input
                    required type="text" value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                    placeholder="+251 ..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-6 py-2 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl"
                >
                  {editingId ? 'Update Address' : 'Save to Address Book'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group">
                <div className="pr-12">
                  <p className="font-black text-gray-900 text-lg mb-1">{addr.street}</p>
                  <p className="text-gray-500 font-medium">
                    {addr.city}, {addr.state} {addr.zipCode}<br/>
                    <span className="text-gray-300 uppercase text-[10px] font-black tracking-[0.2em]">{addr.country}</span>
                  </p>
                  {addr.phoneNumber && (
                    <p className="text-xs text-orange-500 font-black mt-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-200 rounded-full"></span>
                      {addr.phoneNumber}
                    </p>
                  )}
                </div>
                
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-orange-500 hover:shadow-md transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-3 bg-gray-50 text-rose-400 rounded-2xl hover:bg-white hover:text-rose-500 hover:shadow-md transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AddressSection;
