'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Info,
  Building,
  History,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WithdrawalRecord {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankAccountSnapshot: string;
  createdAt: string;
  processedAt: string | null;
}

export default function SellerWithdrawalsPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bankConfigured, setBankConfigured] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes, settingsRes] = await Promise.all([
        api.get('/api/seller/dashboard/summary'),
        api.get('/api/seller/withdrawals/history'),
        api.get('/api/seller/settings')
      ]);
      setBalance(statsRes.data?.data?.availableBalance || 0);
      setHistory(historyRes.data?.data || []);
      setBankConfigured(!!settingsRes.data?.data?.bankAccount?.accountNumber);
    } catch (e) {
      console.error('Failed to fetch withdrawal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankConfigured) return toast.error('Please configure your bank account in Settings first');
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return toast.error('Enter a valid amount');
    if (val > balance) return toast.error('Insufficient balance');

    setSubmitting(true);
    try {
      await api.post('/api/seller/withdrawals/request', { amount: val });
      toast.success('Withdrawal request submitted!');
      setAmount('');
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Withdrawals</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Withdraw your earned funds to your linked bank account.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Request Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
              borderRadius: '24px', 
              padding: '2rem',
              color: 'white',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Available Balance</span>
              <Wallet size={24} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>ETB {balance.toLocaleString()}</h2>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Info size={16} /> Funds are released from escrow once orders are delivered.
            </div>
          </motion.div>

          {/* Form Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontSize: '1.25rem' }}>Request Payout</h3>
            
            {!bankConfigured ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.25rem', color: '#f87171', fontSize: '0.9rem' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>⚠️ Bank details missing</p>
                <p style={{ margin: '0.25rem 0 0' }}>Please update your <a href="/seller/settings" style={{ textDecoration: 'underline' }}>settings</a> to request payouts.</p>
              </div>
            ) : (
              <form onSubmit={handleRequest}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Amount to Withdraw (ETB)</label>
                   <input 
                      type="number" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 500.00"
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '12px', 
                        padding: '1rem', 
                        color: 'white', 
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }} 
                   />
                </div>
                <button 
                  disabled={submitting || !amount || parseFloat(amount) > balance}
                  style={{ 
                    width: '100%', 
                    background: (submitting || !amount || parseFloat(amount) > balance) ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {submitting ? 'Processing...' : <><ArrowUpRight size={18} /> Confirm Withdrawal</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '2rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <History size={20} color="#6366f1" />
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem' }}>Recent Activity</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                  <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No withdrawal requests found.</p>
                </div>
              ) : history.map(record => (
                <div key={record.id} style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>ETB {record.amount.toLocaleString()}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div style={{ 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: '8px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      background: record.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: record.status === 'APPROVED' ? '#10b981' : record.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {record.status === 'APPROVED' ? <CheckCircle size={12} /> : record.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                      {record.status}
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.75rem' }}>
                    <Building size={14} /> {record.bankAccountSnapshot}
                  </div>
                  {record.processedAt && (
                    <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.7rem', fontWeight: 600 }}>
                      ✓ Processed on {new Date(record.processedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
