'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import PasswordChange from '@/components/profile/PasswordChange';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { getImageUrl } from '@/util/imageUtils';
import { toast } from 'react-hot-toast';
import { User, Phone, Mail, Save, X, Loader2 } from 'lucide-react';

const PersonalInfo = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
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
        setIsEditing(false);
        window.location.reload(); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
               <User size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900 uppercase italic">Personal Identity</h2>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Verified System Bio</p>
             </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
          >
            Modify Profile
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Name</span>
              <p className="text-lg font-black text-gray-900">{user?.firstName} {user?.lastName}</p>
           </div>
           
           <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Access</span>
              <p className="text-lg font-black text-gray-900 flex items-center gap-2">
                 <Mail size={16} className="text-orange-500" />
                 {user?.email}
              </p>
           </div>

           <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connect Contact</span>
              <div className="bg-orange-500 p-8 text-white flex items-center space-x-6">
                <AvatarUpload 
                  currentUrl={getImageUrl(user?.profilePictureUrl)} 
                  initials={`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`} 
                />
                <p className="text-lg font-black text-white flex items-center gap-2">
                   <Phone size={16} />
                   {user?.phoneNumber || 'Not provided'}
                </p>
              </div>
           </div>

           <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Type</span>
              <div className="pt-2">
                <span className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
                   {user?.role}
                </span>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-2xl p-8 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-2xl font-black text-gray-900 uppercase italic">Editing Profile</h2>
         <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
         </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-orange-500 focus:bg-white transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-orange-500 focus:bg-white transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-orange-500 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Deploy Changes</>}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-8 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
          >
            Abort
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
