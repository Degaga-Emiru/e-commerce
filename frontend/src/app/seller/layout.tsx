'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SellerSidebar from '@/components/seller/SellerSidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '5rem' }}>
        <div className="seller-spinner" />
        <p>Loading seller portal...</p>
      </div>
    </div>
  );

  if (!isAuthenticated || (user?.role !== 'SELLER' && user?.role !== 'ADMIN')) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <SellerSidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px', // Matches sidebar width
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative'
      }}>
        {children}
      </main>
    </div>
  );
}
