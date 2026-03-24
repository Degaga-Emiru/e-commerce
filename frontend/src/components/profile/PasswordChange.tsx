'use client';

import React, { useState } from 'react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Lock, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const PasswordChange = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.put('/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      if (response.data.success) {
        toast.success('Password changed successfully');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string, 
    name: string, 
    value: string, 
    icon: React.ReactNode, 
    showState: boolean, 
    setShowState: (val: boolean) => void
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={showState ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          required
        />
        <button
          type="button"
          onClick={() => setShowState(!showState)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
        >
          {showState ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 font-medium">Ensure your account uses a long, random password to stay secure.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {renderInput('Current Password', 'currentPassword', formData.currentPassword, <Unlock size={18} />, showCurrent, setShowCurrent)}
        
        <div className="border-t border-gray-100 py-2"></div>
        
        {renderInput('New Password', 'newPassword', formData.newPassword, <Key size={18} />, showNew, setShowNew)}
        {renderInput('Confirm New Password', 'confirmPassword', formData.confirmPassword, <Lock size={18} />, showNew, setShowNew)}

        <div className="pt-4 flex justify-end border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Use an alternate icon since unlock wasn't imported from lucide
// Just inline a wrapper for logic
const Unlock = ({size}: {size: number}) => <Lock size={size} className="opacity-60" />;

export default PasswordChange;
