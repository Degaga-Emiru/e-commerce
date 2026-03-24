'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Package, Settings, LogOut, ChevronRight, MapPin, ArrowLeft, LayoutDashboard, ShieldCheck, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AddressSection from '@/components/profile/AddressSection';
import DashboardStats from '@/components/profile/DashboardStats';
import PersonalInfo from '@/components/profile/PersonalInfo';
import PasswordChange from '@/components/profile/PasswordChange';

const ProfilePage = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'addresses' | 'orders' | 'info' | 'password' | 'settings'>('menu');
  const router = useRouter();

  // Fix: Move side-effect redirect to useEffect to skip render-time update error
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Role-specific dashboard links
  let menuItems: any[] = [];
  
  if (user?.role === 'ADMIN') {
    menuItems = [
      { id: 'admin-dash', icon: <ShieldCheck size={20} />, label: 'Admin Panel', description: 'System administration and management' },
      { id: 'info', icon: <User size={20} />, label: 'Personal Info', description: 'Update your profile details' },
      { id: 'password', icon: <Settings size={20} />, label: 'Password Change', description: 'Change your account password securely' }
    ];
  } else if (user?.role === 'SELLER') {
    menuItems = [
      { id: 'seller-dash', icon: <LayoutDashboard size={20} />, label: 'Seller Dashboard', description: 'Manage products, orders, and shop settings' },
      { id: 'orders', icon: <Package size={20} />, label: 'My Orders', description: 'Track and manage your orders' },
      { id: 'addresses', icon: <MapPin size={20} />, label: 'My Addresses', description: 'Manage your shipping addresses' },
      { id: 'info', icon: <User size={20} />, label: 'Personal Info', description: 'Update your profile details' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Account Settings', description: 'Manage security and preferences' }
    ];
  } else {
    menuItems = [
      { id: 'orders', icon: <Package size={20} />, label: 'My Orders', description: 'Track and manage your orders' },
      { id: 'coupons', icon: <Ticket size={20} />, label: 'My Coupons', description: 'View active discounts and promotions' },
      { id: 'addresses', icon: <MapPin size={20} />, label: 'My Addresses', description: 'Manage your shipping addresses' },
      { id: 'info', icon: <User size={20} />, label: 'Personal Info', description: 'Update your profile details' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Account Settings', description: 'Manage security and preferences' }
    ];
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'addresses':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 font-bold transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Profile
            </button>
            <AddressSection />
          </div>
        );
      case 'info':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 font-bold transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Profile
            </button>
            <PersonalInfo />
          </div>
        );
      case 'password':
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 font-bold transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Profile
            </button>
            <PasswordChange />
          </div>
        );
      case 'orders':
        return (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Order history coming soon!</p>
            <button onClick={() => setActiveTab('menu')} className="mt-4 text-orange-500 font-bold">Back</button>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'addresses' || item.id === 'info' || item.id === 'password' || item.id === 'settings') {
                    setActiveTab(item.id as any);
                  } else if (item.id === 'orders') {
                    router.push('/profile/orders');
                  } else if (item.id === 'coupons') {
                    router.push('/profile/coupons');
                  } else if (item.id === 'seller-dash') {
                    router.push('/seller/dashboard');
                  } else if (item.id === 'admin-dash') {
                    router.push('/admin/dashboard');
                  } else {
                    toast.error(`${item.label} features coming soon!`);
                  }
                }}
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
              className="flex items-center space-x-4 p-6 rounded-xl hover:bg-red-50 transition-colors text-red-500 font-bold mt-4 text-left w-full"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-orange-500 p-8 text-white flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold uppercase">
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
          {activeTab === 'menu' && <DashboardStats />}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
