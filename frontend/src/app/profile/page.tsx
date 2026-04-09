'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { Loader2, LogOut, Trash2 } from 'lucide-react';

// New Components
import ProfileTabs from '@/components/profile/ProfileTabs';
import OverviewSection from '@/components/profile/OverviewSection';
import PaymentSection from '@/components/profile/PaymentSection';
import RefundSection from '@/components/profile/RefundSection';
import FeedbackSection from '@/components/profile/FeedbackSection';
import AddressSection from '@/components/profile/AddressSection';

// Existing Internal Components (Refactored)
import { 
  AvatarSection, 
  EditProfileForm, 
  ChangePasswordForm, 
  DeleteAccountDialog 
} from './ProfileComponents';

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading, logout, login, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [user, setUser] = useState(authUser);

  useEffect(() => { setUser(authUser); }, [authUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleUserUpdated = (updatedUser: any) => {
    setUser(updatedUser);
    if (token) login(updatedUser, token);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showDeleteDialog && (
        <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} onDelete={() => {}} />
      )}

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <AvatarSection user={user} onUpdated={handleUserUpdated} />
            <div className="text-center md:text-left pt-4 flex-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-400 font-medium text-lg">Manage your account settings and track your activities.</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-orange-100 shadow-sm">
                  {user?.role} Account
                </span>
                <button 
                  onClick={() => { logout(); router.push('/'); toast.success('Logged out'); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === 'overview' && (
          isEditing ? (
            <div className="max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 mx-auto">
              <h3 className="text-xl font-black text-gray-900 mb-8">Edit Your Profile</h3>
              <EditProfileForm user={user} onUpdated={handleUserUpdated} onCancel={() => setIsEditing(false)} />
            </div>
          ) : (
            <OverviewSection user={user} onEdit={() => setIsEditing(true)} />
          )
        )}

        {activeTab === 'orders' && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-2xl font-black text-gray-900 mb-4">Looking for your orders?</h3>
             <p className="text-gray-500 mb-8 max-w-md mx-auto">We have a dedicated page for tracking and managing your purchases.</p>
             <button 
               onClick={() => router.push('/profile/orders')}
               className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
             >
               Go to My Orders
             </button>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <AddressSection />
          </div>
        )}

        {activeTab === 'payments' && <PaymentSection />}
        {activeTab === 'refunds' && <RefundSection />}
        {activeTab === 'feedback' && <FeedbackSection />}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-8">Security Settings</h3>
              <ChangePasswordForm onClose={() => setActiveTab('overview')} />
            </section>
            
            <section className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 flex flex-col justify-center text-center">
              <h3 className="text-xl font-black text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700/60 font-medium mb-8">Deleting your account is permanent. All your data will be lost.</p>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full bg-white border-2 border-red-100 text-red-500 font-black py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                Delete Account
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
