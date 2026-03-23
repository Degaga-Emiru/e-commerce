'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Store, Save, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ shopName: '', description: '', logoUrl: '' });
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/profile').then(r => {
      const data = r.data;
      if (data && data.shopName) {
        setForm({ 
          shopName: data.shopName, 
          description: data.description || '', 
          logoUrl: data.logoUrl || '' 
        });
        setVerified(data.verified || false);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.shopName.trim()) return toast.error('Shop name is required');
    setSaving(true);
    try {
      await api.post('/seller/profile', form);
      toast.success('Shop profile saved successfully!');
      // Redirect to dashboard so the "Complete your profile" prompt disappears
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 1000);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        <Link href="/seller/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: '1.5rem', fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1,#8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Shop Settings</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>{user?.email}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: verified ? '#10b981' : '#f59e0b', fontSize: 14, fontWeight: 600 }}>
            {verified ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {verified ? 'Verified Seller' : 'Pending Verification'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2rem' }}>
          {(['shopName', 'description', 'logoUrl'] as const).map((key) => (
            <div key={key} style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {key === 'shopName' ? 'Shop Name *' : key === 'description' ? 'Description' : 'Logo URL'}
              </label>
              {key === 'description' ? (
                <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={4}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.875rem 1rem', color: '#f1f5f9', fontSize: 15, resize: 'vertical', boxSizing: 'border-box' }} />
              ) : (
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} type="text"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.875rem 1rem', color: '#f1f5f9', fontSize: 15, boxSizing: 'border-box' }} />
              )}
            </div>
          ))}

          <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.875rem 2rem', fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Save size={18} /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
