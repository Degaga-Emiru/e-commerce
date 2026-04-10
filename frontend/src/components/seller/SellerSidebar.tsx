'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wallet, 
  Settings, 
  LogOut,
  Store,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/seller/dashboard' },
  { name: 'Products', icon: <Package size={20} />, path: '/seller/products' },
  { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/seller/orders' },
  { name: 'Withdrawals', icon: <Wallet size={20} />, path: '/seller/withdrawals' },
  { name: 'Shop Settings', icon: <Settings size={20} />, path: '/seller/settings' },
  { name: 'My Profile', icon: <User size={20} />, path: '/profile' },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    }}>
      {/* Brand */}
      <div style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <Store size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.025em' }}>Seller Portal</h2>
          <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase' }}>Management HUB</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        <p style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: '#475569', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          padding: '0 0.75rem 0.75rem',
          margin: 0
        }}>
          Main Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.925rem',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ color: isActive ? '#818cf8' : 'inherit' }}>{item.icon}</div>
                <span style={{ flex: 1 }}>{item.name}</span>
                {isActive && <div style={{ 
                  width: '4px', 
                  height: '16px', 
                  background: '#6366f1', 
                  borderRadius: '4px',
                  position: 'absolute',
                  left: 0
                }} />}
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User info & Logout */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#6366f1',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#f87171',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
