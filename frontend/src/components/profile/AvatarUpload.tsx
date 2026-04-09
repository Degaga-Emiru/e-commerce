'use client';

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Loader2, X } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/util/imageUtils';

interface AvatarUploadProps {
  currentUrl?: string;
  initials: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentUrl, initials }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(getImageUrl(currentUrl));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login, user, token } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const response = await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        setPreview(getImageUrl(updatedUser.profilePictureUrl));
        // Update local auth state to reflect new picture
        if (user && token) {
           login(updatedUser, token);
        }
        toast.success('Profile picture updated');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setLoading(true);
    try {
      const response = await api.delete('/users/profile/picture');
      if (response.data.success) {
        setPreview(undefined);
        const updatedUser = response.data.data;
        if (user && token) {
           login(updatedUser, token);
        }
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl flex items-center justify-center bg-white/10 text-3xl font-black uppercase ring-4 ring-orange-500/30 transition-all group-hover:ring-orange-500/50">
        {loading ? (
          <Loader2 className="animate-spin text-white" size={32} />
        ) : preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white opacity-80">{initials}</span>
        )}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white text-gray-900 rounded-full mb-1 hover:scale-110 mb-2 transition-all shadow-lg overflow-hidden relative"
          title="Upload New"
          disabled={loading}
        >
          <Camera size={18} />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </button>
        {preview && (
          <button 
            onClick={handleDelete}
            className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-all shadow-lg"
            title="Remove Picture"
            disabled={loading}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full flex items-center justify-center">
           <Loader2 className="animate-spin text-white" />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
