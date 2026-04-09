'use client';

import React from 'react';
import { 
  User as UserIcon, Mail, Phone, MapPin, 
  ChevronRight, Calendar, Shield, CreditCard 
} from 'lucide-react';
import Link from 'next/link';

interface OverviewSectionProps {
  user: any;
  onEdit: () => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ user, onEdit }) => {
  const stats = [
    { label: 'Total Orders', value: '12', icon: <Package className="text-orange-500" /> },
    { label: 'Wishlist Items', value: '5', icon: <Heart className="text-rose-500" /> },
    { label: 'Saved Addresses', value: '2', icon: <MapPin className="text-blue-500" /> },
    { label: 'Reviews Given', value: '8', icon: <MessageSquare className="text-emerald-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Personal Information</h3>
            <button 
              onClick={onEdit}
              className="text-orange-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'First Name', value: user?.firstName, icon: <UserIcon size={18} className="text-orange-400" /> },
              { label: 'Last Name', value: user?.lastName, icon: <UserIcon size={18} className="text-orange-400" /> },
              { label: 'Email Address', value: user?.email, icon: <Mail size={18} className="text-orange-400" />, full: true },
              { label: 'Phone Number', value: user?.phoneNumber ?? 'Not provided', icon: <Phone size={18} className="text-orange-400" /> },
              { label: 'Account Type', value: user?.role, icon: <Shield size={18} className="text-orange-400" /> },
            ].map(({ label, value, icon, full }) => (
              <div key={label} className={`space-y-2 ${full ? 'md:col-span-2' : ''}`}>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">{label}</span>
                <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
                  <p className="font-bold text-gray-900 text-lg">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </section>
      </div>

      {/* Right-side Quick Summary */}
      <div className="space-y-8">
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Address Summary</h3>
          {user?.address ? (
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-900 mb-1">{user.address.street}</p>
                <p className="text-sm text-gray-500">{user.address.city}, {user.address.zipCode}</p>
              </div>
              <Link href="#" className="flex items-center justify-between text-orange-500 font-black text-xs uppercase tracking-widest group">
                Manage Addresses <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-4 font-medium">No primary address set</p>
              <Link href="#" className="inline-block bg-gray-50 text-gray-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
                Add Address
              </Link>
            </div>
          )}
        </section>

        <section className="bg-orange-600 rounded-[2rem] p-8 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-lg font-black mb-2 relative z-10">Premium Member</h3>
          <p className="text-orange-100 text-sm font-medium mb-6 relative z-10">You have saved $145.00 this month with exclusive coupons!</p>
          <button className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg relative z-10">
            View My Coupons
          </button>
        </section>
      </div>
    </div>
  );
};

// Internal imports for the icons to avoid missing imports in this snippet
import { Package, Heart, MessageSquare } from 'lucide-react';

export default OverviewSection;
