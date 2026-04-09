'use client';

import React from 'react';
import { 
  User, Package, MapPin, CreditCard, 
  RotateCcw, MessageSquare, Shield 
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <User size={18} /> },
  { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
  { id: 'refunds', label: 'Refunds', icon: <RotateCcw size={18} /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
];

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all relative
              ${isActive 
                ? 'text-orange-500' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProfileTabs;
