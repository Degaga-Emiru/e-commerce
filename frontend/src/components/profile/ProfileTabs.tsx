'use client';

import React from 'react';
import {
  User, Package, MapPin, CreditCard,
  RotateCcw, MessageSquare, Shield,
  Store, BarChart2
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
}

const baseTabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <User size={18} /> },
  { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
  { id: 'refunds', label: 'Refunds', icon: <RotateCcw size={18} /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
];

const sellerTab: Tab = { id: 'seller', label: 'My Shop', icon: <Store size={18} /> };
const adminTab: Tab = { id: 'admin', label: 'Platform', icon: <BarChart2 size={18} /> };

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab, userRole }) => {
  const tabs = [...baseTabs];

  // Insert role-specific tab right after 'overview'
  if (userRole === 'SELLER') {
    tabs.splice(1, 0, sellerTab);
  } else if (userRole === 'ADMIN') {
    tabs.splice(1, 0, adminTab);
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isRoleTab = tab.id === 'seller' || tab.id === 'admin';
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all relative
              ${isActive
                ? isRoleTab ? 'text-indigo-500' : 'text-orange-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {isActive && (
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full ${isRoleTab ? 'bg-indigo-500' : 'bg-orange-500'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProfileTabs;
