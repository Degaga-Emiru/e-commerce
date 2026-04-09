'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const DeliveryBar = () => {
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('Addis Ababa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const res = await api.get('/addresses');
          if (res.data && res.data.length > 0) {
            // Use the first city found
            setCity(res.data[0].city);
          }
        } catch (error) {
          console.warn('Failed to fetch delivery city');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLocation();
  }, [isAuthenticated]);

  return (
    <div className="bg-gray-100/50 border-b border-gray-100 flex items-center px-6 py-2.5 gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
      <MapPin size={14} className="text-orange-500 shrink-0" />
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Deliver to</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 truncate">
          {loading ? '...' : city}
        </span>
      </div>
      <ChevronDown size={12} className="text-gray-400" />
    </div>
  );
};

export default DeliveryBar;
