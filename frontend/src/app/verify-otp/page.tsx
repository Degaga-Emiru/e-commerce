'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('No email found for verification. Please register again.');
      router.push('/register');
    }
  }, [email, router]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otpCode });
      toast.success('Email verified successfully! You can now login.');
      router.push('/login');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center container mx-auto px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-orange-500/5 text-center">
        <div className="bg-orange-50 text-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Mail size={32} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-500 mb-10">
          We've sent a 6-digit verification code to <br/>
          <span className="font-bold text-gray-900">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-14 text-2xl font-black text-center border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:outline-none transition-all bg-gray-50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>Verify Account <ArrowRight size={20} className="ml-2" /></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-orange-500 font-bold hover:underline disabled:text-gray-400"
            >
              {resending ? 'Resending...' : 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
