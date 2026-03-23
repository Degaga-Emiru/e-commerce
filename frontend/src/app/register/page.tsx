'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Account created! Please check your email for the OTP.');
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center container mx-auto px-4 py-16 bg-gray-50/50">
      <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-orange-500/5">
        <div className="text-center mb-10 text-gray-900">
          <h1 className="text-4xl font-black mb-2">Create Account</h1>
          <p className="text-gray-500">Start your premium shopping journey today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              placeholder="you@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="CUSTOMER text-gray-900">Customer (Buying Items)</option>
              <option value="SELLER text-gray-900">Seller (Selling Items)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-[0.98] mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : 'Complete Registration'}
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-bold text-gray-400">
          By signing up, you agree to our <span className="text-orange-500 underline cursor-pointer">Terms of Service</span>.
        </p>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
