'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { User, Phone, Mail, Save } from 'lucide-react';

const PersonalInfo = () => {
  const { user, login } = useAuth(); // Assuming login or a refresh function exists to update context, or we just reload
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        // Optionally trigger a re-fetch of user data here if needed
        window.location.reload(); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-500 font-medium">Update your profile details and contact info</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">First Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Last Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={user?.email || ''}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed outline-none"
              disabled
              readOnly
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">Email cannot be changed directly.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
