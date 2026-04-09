'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, History, Plus, Trash2, 
  CheckCircle2, Clock, AlertCircle, Loader2 
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface PaymentHistory {
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  bankReference?: string;
}

const PaymentSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'cards'>('history');
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock cards for demo
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', holder: 'John Doe', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '05/25', holder: 'John Doe', isDefault: false },
  ]);

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchHistory();
    }
  }, [activeSubTab]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/me');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
      toast.error('Could not load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'PENDING':
        return <Clock className="text-amber-500" size={16} />;
      default:
        return <AlertCircle className="text-rose-500" size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
            activeSubTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <History size={16} /> History
        </button>
        <button
          onClick={() => setActiveSubTab('cards')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
            activeSubTab === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CreditCard size={16} /> Saved Cards
        </button>
      </div>

      {activeSubTab === 'history' ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-black text-xs text-gray-900 font-mono tracking-tighter uppercase">{tx.transactionId}</td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">{new Date(tx.paymentDate).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-sm font-black text-gray-900">${tx.amount.toFixed(2)}</td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-bold uppercase">{tx.paymentMethod}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                          tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <History size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No transaction history found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <CreditCard className="text-white/40" size={32} />
                <button className="p-2 bg-white/10 rounded-xl hover:bg-rose-500 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mt-12 relative z-10">
                <p className="text-2xl font-black tracking-[0.2em] mb-4">•••• •••• •••• {card.last4}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Card Holder</p>
                    <p className="font-bold">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Expires</p>
                    <p className="font-bold">{card.expiry}</p>
                  </div>
                </div>
              </div>
              
              {card.isDefault && (
                <div className="absolute top-4 right-14 bg-orange-500 text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest">
                  Default
                </div>
              )}
              
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          ))}
          
          <button className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50/50 transition-all active:scale-95 min-h-[220px]">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Plus size={24} />
            </div>
            <p className="font-black text-xs uppercase tracking-widest">Add New Card</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
