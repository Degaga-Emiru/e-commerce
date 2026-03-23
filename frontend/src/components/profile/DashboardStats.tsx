'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Package, MapPin, ShoppingCart, DollarSign, Box, Users, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Stats {
  [key: string]: any;
}

const DashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Silent error for dashboard stats, but console it
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const renderStats = () => {
    if (user?.role === 'ADMIN') {
      return (
        <>
          <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={<Box />} label="Total Sellers" value={stats.totalSellers} color="purple" />
          <StatCard icon={<Package />} label="Total Orders" value={stats.totalOrders} color="orange" />
          <StatCard icon={<DollarSign />} label="Platform Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} color="green" />
        </>
      );
    } else if (user?.role === 'SELLER') {
      return (
        <>
          <StatCard icon={<Package />} label="Total Orders" value={stats.totalOrders} color="orange" />
          <StatCard icon={<Box />} label="My Products" value={stats.totalProducts} color="blue" />
          <StatCard icon={<TrendingUp />} label="Total Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} color="green" />
          <StatCard icon={<CreditCard />} label="Payout Status" value="Processing" color="purple" />
        </>
      );
    } else {
      return (
        <>
          <StatCard icon={<Package />} label="My Orders" value={stats.totalOrders} color="orange" />
          <StatCard icon={<TrendingUp />} label="Pending" value={stats.pendingOrders} color="blue" />
          <StatCard icon={<ShoppingCart />} label="Cart Items" value={stats.cartItems} color="green" />
          <StatCard icon={<MapPin />} label="Saved Addresses" value={stats.totalAddresses} color="purple" />
        </>
      );
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {renderStats()}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: any;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500',
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2 w-10 h-10 rounded-xl ${colors[color]} mb-3 flex items-center justify-center`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <h3 className="text-xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  );
};

export default DashboardStats;
