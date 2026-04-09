'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { getImageUrl } from '@/util/imageUtils';
import {
  Camera, Trash2, Save, Lock, Phone, Loader2, X, Eye, EyeOff,
  AlertTriangle, Check
} from 'lucide-react';

// ─── Avatar Section ───────────────────────────────────────────────────────────
export function AvatarSection({ user, onUpdated }: { user: any; onUpdated: (u: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    user?.profilePictureUrl ? getImageUrl(user.profilePictureUrl) : undefined
  );
  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  useEffect(() => {
    if (user?.profilePictureUrl) {
      setPreview(getImageUrl(user.profilePictureUrl));
    } else {
      setPreview(undefined);
    }
  }, [user?.profilePictureUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    try {
      const res = await api.post('/users/profile/picture', formData);
      if (res.data.success) {
        onUpdated(res.data.data);
        toast.success('Photo updated!');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove profile photo?')) return;
    setLoading(true);
    try {
      const res = await api.delete('/users/profile/picture');
      if (res.data.success) {
        onUpdated(res.data.data);
        toast.success('Photo removed');
      }
    } catch {
      toast.error('Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-white shadow-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center">
        {loading ? (
          <Loader2 className="animate-spin text-white" size={40} />
        ) : preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-black text-5xl">{initials}</span>
        )}
      </div>
      <div
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 rounded-[2.5rem] bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <Camera className="text-white mb-1" size={24} />
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Change</span>
      </div>
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      
      {preview && (
        <button 
          onClick={handleDelete}
          className="absolute -bottom-2 -right-2 p-3 bg-white text-rose-500 rounded-2xl shadow-lg border border-gray-100 hover:bg-rose-50 transition-all"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

// ─── Edit Profile Form ────────────────────────────────────────────────────────
export function EditProfileForm({ user, onUpdated, onCancel }: { user: any; onUpdated: (u: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      if (res.data.success) {
        onUpdated(res.data.data);
        toast.success('Profile updated!');
        onCancel();
      }
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">First Name</label>
        <input
          type="text" value={form.firstName}
          onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Last Name</label>
        <input
          type="text" value={form.lastName}
          onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <div className="md:col-span-2 space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Phone Number</label>
        <input
          type="tel" value={form.phoneNumber}
          onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <div className="md:col-span-2 flex gap-4 pt-4">
        <button type="submit" disabled={loading} className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="px-8 bg-gray-100 text-gray-600 font-bold rounded-2xl">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────
export function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/users/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      onClose();
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Current Password</label>
        <input
          type="password" value={form.currentPassword}
          onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">New Password</label>
        <input
          type="password" value={form.newPassword}
          onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Confirm New Password</label>
        <input
          type="password" value={form.confirmPassword}
          onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl">
        Update Password
      </button>
    </form>
  );
}

// ─── Delete Account Dialog ────────────────────────────────────────────────────
export function DeleteAccountDialog({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState('');
  const { logout } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      await api.delete('/users/profile');
      logout();
      router.push('/');
      toast.success('Account deleted');
    } catch {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Are you absolutely sure?</h2>
          <p className="text-gray-500 text-sm font-medium">This action cannot be undone. All your data will be permanently deleted.</p>
        </div>
        <div className="mt-8 space-y-4">
          <input
            type="text" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full bg-gray-50 border-2 border-red-100 rounded-2xl px-5 py-4 font-bold text-red-500 text-center outline-none"
          />
          <div className="flex gap-4">
            <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20">Delete</button>
            <button onClick={onClose} className="px-8 bg-gray-100 text-gray-600 font-bold rounded-2xl">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
