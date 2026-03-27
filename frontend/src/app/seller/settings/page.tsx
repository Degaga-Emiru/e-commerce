'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Store, 
  User, 
  Lock, 
  Wallet, 
  Bell, 
  Save, 
  CheckCircle,
  AlertCircle,
  Building,
  CreditCard,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'store' | 'profile' | 'bank' | 'security' | 'notifications';

export default function SellerSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    user: { firstName: '', lastName: '', email: '', phoneNumber: '' },
    profile: { shopName: '', description: '', logoUrl: '', businessAddress: '', taxId: '', businessRegistrationNumber: '', emailNewOrder: true, emailShippingUpdate: true, emailEscrowRelease: true },
    bankAccount: { bankName: '', accountHolderName: '', accountNumber: '', branchName: '', swiftCode: '' }
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/seller/settings');
        if (res.data?.data) {
          const d = res.data.data;
          setFormData({
            user: d.user || formData.user,
            profile: { ...formData.profile, ...d.profile },
            bankAccount: d.bankAccount || formData.bankAccount
          });
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: formData.user.firstName,
        lastName: formData.user.lastName,
        phoneNumber: formData.user.phoneNumber,
        shopName: formData.profile.shopName,
        description: formData.profile.description,
        businessAddress: formData.profile.businessAddress,
        taxId: formData.profile.taxId,
        businessRegistrationNumber: formData.profile.businessRegistrationNumber
      };
      await api.put('/api/seller/settings/profile', payload);
      toast.success('Profile settings saved!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const saveBank = async () => {
    setSaving(true);
    try {
      await api.post('/api/seller/settings/bank', formData.bankAccount);
      toast.success('Bank account details updated!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save bank info');
    } finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/api/seller/settings/notifications', {
        emailNewOrder: formData.profile.emailNewOrder,
        emailShippingUpdate: formData.profile.emailShippingUpdate,
        emailEscrowRelease: formData.profile.emailEscrowRelease
      });
      toast.success('Notification preferences updated!');
    } catch (e: any) {
      toast.error('Failed to update notifications');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/api/seller/settings/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const tabs: {id: Tab, label: string, icon: any}[] = [
    { id: 'store', label: 'Store Info', icon: <Store size={18} /> },
    { id: 'profile', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'bank', label: 'Bank Account', icon: <Wallet size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.875rem 1rem',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    margin: '0 0 0.5rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 600
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Account Settings</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Manage your shop properties, personal profile and payouts.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '16px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#64748b',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '2rem',
          minHeight: '400px'
        }}>
          <AnimatePresence mode="wait">
            {activeTab === 'store' && (
              <motion.div key="store" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#6366f115', color: '#6366f1', padding: '0.75rem', borderRadius: '12px' }}><Store size={24} /></div>
                  <h3 style={{ margin: 0, color: '#f1f5f9' }}>Store Configuration</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Shop Name</label>
                      <input style={inputStyle} value={formData.profile.shopName} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, shopName: e.target.value } }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Logo URL</label>
                      <input style={inputStyle} value={formData.profile.logoUrl} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, logoUrl: e.target.value } }))} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Shop Description</label>
                    <textarea style={{ ...inputStyle, minHeight: '100px' }} value={formData.profile.description} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, description: e.target.value } }))} />
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Legal & Tax Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Tax ID / VAT Number</label>
                        <input style={inputStyle} value={formData.profile.taxId} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, taxId: e.target.value } }))} placeholder="e.g. 123-456-789" />
                      </div>
                      <div>
                        <label style={labelStyle}>Registration Number</label>
                        <input style={inputStyle} value={formData.profile.businessRegistrationNumber} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, businessRegistrationNumber: e.target.value } }))} placeholder="BR-987654" />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Business Address</label>
                      <input style={inputStyle} value={formData.profile.businessAddress} onChange={e => setFormData(p => ({ ...p, profile: { ...p.profile, businessAddress: e.target.value } }))} />
                    </div>
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} style={{ marginTop: '2rem', background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#10b98115', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}><User size={24} /></div>
                  <h3 style={{ margin: 0, color: '#f1f5f9' }}>Personal Information</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input style={inputStyle} value={formData.user.firstName} onChange={e => setFormData(p => ({ ...p, user: { ...p.user, firstName: e.target.value } }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input style={inputStyle} value={formData.user.lastName} onChange={e => setFormData(p => ({ ...p, user: { ...p.user, lastName: e.target.value } }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address (Read-only)</label>
                    <input style={{ ...inputStyle, opacity: 0.6 }} value={formData.user.email} readOnly />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} value={formData.user.phoneNumber} onChange={e => setFormData(p => ({ ...p, user: { ...p.user, phoneNumber: e.target.value } }))} />
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} style={{ marginTop: '2rem', background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </motion.div>
            )}

            {activeTab === 'bank' && (
              <motion.div key="bank" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#6366f115', color: '#6366f1', padding: '0.75rem', borderRadius: '12px' }}><Wallet size={24} /></div>
                  <h3 style={{ margin: 0, color: '#f1f5f9' }}>Payout Destination</h3>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} /> Funds will be sent here upon withdrawal request.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Bank Name</label>
                    <input style={inputStyle} value={formData.bankAccount.bankName} onChange={e => setFormData(p => ({ ...p, bankAccount: { ...p.bankAccount, bankName: e.target.value } }))} placeholder="e.g. Commercial Bank of Ethiopia" />
                  </div>
                  <div>
                    <label style={labelStyle}>Account Holder Name</label>
                    <input style={inputStyle} value={formData.bankAccount.accountHolderName} onChange={e => setFormData(p => ({ ...p, bankAccount: { ...p.bankAccount, accountHolderName: e.target.value } }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Account Number</label>
                    <input style={inputStyle} value={formData.bankAccount.accountNumber} onChange={e => setFormData(p => ({ ...p, bankAccount: { ...p.bankAccount, accountNumber: e.target.value } }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Branch Name (Optional)</label>
                    <input style={inputStyle} value={formData.bankAccount.branchName} onChange={e => setFormData(p => ({ ...p, bankAccount: { ...p.bankAccount, branchName: e.target.value } }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>SWIFT / BIC Code (Optional)</label>
                    <input style={inputStyle} value={formData.bankAccount.swiftCode} onChange={e => setFormData(p => ({ ...p, bankAccount: { ...p.bankAccount, swiftCode: e.target.value } }))} />
                  </div>
                </div>
                <button onClick={saveBank} disabled={saving} style={{ marginTop: '2rem', background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Update Bank Info'}
                </button>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notif" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#ec489915', color: '#ec4899', padding: '0.75rem', borderRadius: '12px' }}><Bell size={24} /></div>
                  <h3 style={{ margin: 0, color: '#f1f5f9' }}>Email Notifications</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { id: 'emailNewOrder', label: 'New Order Placed', sub: 'Get notified immediately when a customer buys your product' },
                    { id: 'emailShippingUpdate', label: 'Shipping Status Updates', sub: 'Receive updates when tracking info is updated' },
                    { id: 'emailEscrowRelease', label: 'Escrow Funds Released', sub: 'Be alerted when funds move to your available balance' }
                  ].map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div>
                        <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 600 }}>{item.label}</p>
                        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{item.sub}</p>
                      </div>
                      <button 
                        onClick={() => setFormData(p => ({ ...p, profile: { ...p.profile, [item.id]: !(p.profile as any)[item.id] } }))}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: (formData.profile as any)[item.id] ? '#6366f1' : '#334155',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.3s'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          background: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '3px',
                          left: (formData.profile as any)[item.id] ? '27px' : '3px',
                          transition: 'left 0.3s'
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={saveNotifications} disabled={saving} style={{ marginTop: '2rem', background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#f59e0b15', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}><Lock size={24} /></div>
                  <h3 style={{ margin: 0, color: '#f1f5f9' }}>Account Security</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '400px' }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <input type="password" style={inputStyle} value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" style={inputStyle} value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" style={inputStyle} value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
                  </div>
                </div>
                <button onClick={changePassword} disabled={saving} style={{ marginTop: '2rem', background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} /> {saving ? 'Changing...' : 'Update Password'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
