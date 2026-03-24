'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
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
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken && savedToken !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
