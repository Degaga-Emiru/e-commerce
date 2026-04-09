'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { getImageUrl } from '@/util/imageUtils';
import {
  Camera, Trash2, LogOut, Save, Lock, Mail, Phone, User, Shield,
  Package, MapPin, ChevronRight, Loader2, X, Eye, EyeOff,
  AlertTriangle, Check, Edit3, Heart
} from 'lucide-react';
import Link from 'next/link';

// ─── Avatar Section ───────────────────────────────────────────────────────────
function AvatarSection({ user, onUpdated }: { user: any; onUpdated: (u: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    user?.profilePictureUrl ? getImageUrl(user.profilePictureUrl) : undefined
  );
  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  // Sync preview if user prop updates externally
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
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    try {
      const res = await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const updated = res.data.data;
        // Keep showing local preview - the backend URL needs the backend to restart
        setPreview(getImageUrl(updated.profilePictureUrl));
        onUpdated(updated);
        toast.success('Photo updated!');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
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
        setPreview(undefined);
        onUpdated(res.data.data);
        toast.success('Photo removed');
      }
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Large Avatar */}
      <div className="relative group">
        <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-white shadow-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center">
          {loading ? (
            <Loader2 className="animate-spin text-white" size={40} />
          ) : preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setPreview(undefined)}
            />
          ) : (
            <span className="text-white font-black text-4xl">{initials}</span>
          )}
        </div>
        {/* Hover overlay */}
        <div
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <Camera className="text-white mb-1" size={22} />
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Change</span>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
        >
          <Camera size={16} /> Change Photo
        </button>
        {preview && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Edit Profile Form ────────────────────────────────────────────────────────
function EditProfileForm({ user, onUpdated, onCancel }: { user: any; onUpdated: (u: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) { toast.error('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      if (res.data.success) {
        onUpdated(res.data.data);
        toast.success('Profile updated!');
        onCancel();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
          <input
            type="text" value={form.firstName}
            onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
          <input
            type="text" value={form.lastName}
            onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="tel" value={form.phoneNumber}
            onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
            placeholder="+251 9XX XXX XXX"
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-11 pr-4 py-3 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-orange-500 text-white font-black py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/users/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ field, label }: { field: 'current' | 'new' | 'confirm'; label: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={e => setForm(p => ({
            ...p,
            [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value
          }))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-11 pr-11 py-3 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
          required
        />
        <button type="button" onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput field="current" label="Current Password" />
      <PasswordInput field="new" label="New Password" />
      <PasswordInput field="confirm" label="Confirm New Password" />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-gray-900 text-white font-black py-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Update Password</>}
        </button>
        <button type="button" onClick={onClose} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
      </div>
    </form>
  );
}

// ─── Delete Account Dialog ────────────────────────────────────────────────────
function DeleteAccountDialog({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setLoading(true);
    try {
      await api.delete('/users/profile');
      logout();
      toast.success('Account deleted');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Deletion failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Delete Account</h2>
            <p className="text-sm text-gray-500">This action is permanent and cannot be undone.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 font-medium space-y-1">
          <p>• All your orders and history will be erased</p>
          <p>• Your wishlist and reviews will be deleted</p>
          <p>• Your account cannot be recovered</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Type <span className="text-red-500 font-black">DELETE</span> to confirm</label>
          <input
            type="text" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-gray-50 border-2 border-red-100 rounded-xl px-4 py-3 font-bold text-red-500 focus:border-red-400 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDelete} disabled={loading || confirm !== 'DELETE'}
            className="flex-1 bg-red-500 text-white font-black py-3 rounded-xl hover:bg-red-600 transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> Delete Account</>}
          </button>
          <button onClick={onClose} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading, logout, login, token } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'view' | 'edit' | 'password'>('view');
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

  const roleBadge: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-700',
    SELLER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showDeleteDialog && (
        <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} onDelete={() => {}} />
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
          <AvatarSection user={user} onUpdated={handleUserUpdated} />
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-400 font-medium">{user?.email}</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${(user?.role && roleBadge[user.role]) ? roleBadge[user.role] : 'bg-gray-100 text-gray-700'}`}>
                {user?.role}
              </span>
              {user?.phoneNumber && (
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Phone size={14} /> {user.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Info / Edit Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-xl"><User className="text-orange-500" size={20} /></div>
              <div>
                <h2 className="font-black text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-400">Manage your name and contact details</p>
              </div>
            </div>
            {activeSection === 'view' && (
              <button
                onClick={() => setActiveSection('edit')}
                className="flex items-center gap-2 text-orange-500 border-2 border-orange-500 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
              >
                <Edit3 size={14} /> Edit
              </button>
            )}
            {activeSection === 'edit' && (
              <button onClick={() => setActiveSection('view')} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            {activeSection === 'view' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'First Name', value: user?.firstName, icon: <User size={16} className="text-orange-400" /> },
                  { label: 'Last Name', value: user?.lastName, icon: <User size={16} className="text-orange-400" /> },
                  { label: 'Email', value: user?.email, icon: <Mail size={16} className="text-orange-400" />, full: true },
                  { label: 'Phone', value: user?.phoneNumber ?? '—', icon: <Phone size={16} className="text-orange-400" /> },
                ].map(({ label, value, icon, full }) => (
                  <div key={label} className={`space-y-1 ${full ? 'sm:col-span-2' : ''}`}>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                    <p className="font-bold text-gray-900 flex items-center gap-2">{icon} {value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EditProfileForm user={user} onUpdated={handleUserUpdated} onCancel={() => setActiveSection('view')} />
            )}
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-100 rounded-xl"><Shield className="text-gray-600" size={20} /></div>
              <div>
                <h2 className="font-black text-gray-900">Security</h2>
                <p className="text-xs text-gray-400">Update your password</p>
              </div>
            </div>
            {activeSection !== 'password' ? (
              <button
                onClick={() => setActiveSection('password')}
                className="flex items-center gap-2 text-gray-600 border-2 border-gray-200 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:border-gray-400 transition-all"
              >
                <Lock size={14} /> Change
              </button>
            ) : (
              <button onClick={() => setActiveSection('view')} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>
          {activeSection === 'password' && (
            <div className="p-6">
              <ChangePasswordForm onClose={() => setActiveSection('view')} />
            </div>
          )}
        </div>

        {/* Quick Links */}
        {user?.role === 'CUSTOMER' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="font-black text-gray-900">My Account</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { href: '/orders', icon: <Package size={20} className="text-orange-500" />, label: 'My Orders', sub: 'View order history' },
                { href: '/wishlist', icon: <Heart size={20} className="text-rose-500" />, label: 'My Wishlist', sub: 'Saved items' },
                { href: '/profile/addresses', icon: <MapPin size={20} className="text-blue-500" />, label: 'Addresses', sub: 'Manage shipping addresses' },
              ].map(({ href, icon, label, sub }) => (
                <Link href={href} key={href} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">{icon}</div>
                    <div>
                      <p className="font-bold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" size={20} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-6 border-b border-red-50">
            <h2 className="font-black text-red-500">Danger Zone</h2>
            <p className="text-xs text-gray-400 mt-1">Irreversible actions. Please proceed with caution.</p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { logout(); router.push('/'); toast.success('Logged out'); }}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold hover:border-gray-400 hover:text-gray-900 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 text-red-500 px-6 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
