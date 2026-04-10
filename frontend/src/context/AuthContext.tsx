'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  isNewUser?: boolean;
  profilePictureUrl?: string;
  address?: {
    addressId?: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');
    
    if (savedUser && savedToken && savedToken !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!user && !!token,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
