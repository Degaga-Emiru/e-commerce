'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleOAuthSuccess(token);
    }
  }, [searchParams]);

  const handleOAuthSuccess = async (jwt: string) => {
    setLoading(true);
    try {
      // Set the token in the API header temporarily to fetch /me
      api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      const response = await api.get('/auth/me');
      
      login(response.data, jwt);
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      console.error('OAuth finish error:', error);
      toast.error('Social login failed to complete.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      // Backend returns AuthResponse directly: { jwt, id, email, firstName, lastName, role }
      const { jwt } = response.data;
      
      login(response.data, jwt);
      toast.success('Welcome back!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      
      // Fallback for demo if backend is not up
      if (email === 'admin@test.com' && password === 'admin') {
         login({ id: 1, email, firstName: 'Admin', lastName: 'User', role: 'ADMIN' }, 'mock-jwt');
         router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // Redirect to Spring Boot OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center container mx-auto px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-orange-500/5">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Login</h1>
          <p className="text-gray-500">Access your premium shopping experience</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              placeholder="you@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="mt-8">
          <button 
            type="button"
            onClick={handleSocialLogin}
            className="w-full flex items-center justify-center space-x-3 border-2 border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition-all group active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
            <span className="font-bold text-gray-700">Google Account</span>
          </button>
        </div>

        <div className="mt-10 text-center text-sm font-medium text-gray-500">
          New here?{' '}
          <Link href="/register" className="text-orange-500 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
