'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Package, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const menuItems = [
    { icon: <Package size={20} />, label: 'My Orders', description: 'Track and manage your orders' },
    { icon: <User size={20} />, label: 'Personal Info', description: 'Update your profile details' },
    { icon: <Settings size={20} />, label: 'Account Settings', description: 'Manage security and preferences' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-orange-500 p-8 text-white flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="opacity-80">{user?.email}</p>
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs mt-2 uppercase font-mono tracking-widest font-bold">
              {user?.role} Account
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center justify-between p-6 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 text-orange-500 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.label}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-4 p-6 rounded-xl hover:bg-red-50 transition-colors text-red-500 font-bold mt-4"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
