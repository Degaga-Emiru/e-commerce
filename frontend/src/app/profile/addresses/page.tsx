'use client';

import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import AddressSection from '@/components/profile/AddressSection';

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/profile" 
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-orange-500 transition-all border border-transparent hover:border-gray-100"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Addresses</h1>
              <p className="text-sm text-gray-400 font-medium">Your shipping and billing locations</p>
            </div>
          </div>
          <div className="hidden sm:flex p-3 bg-orange-50 rounded-2xl">
            <MapPin className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
          <AddressSection />
        </div>
      </div>
    </div>
  );
}
