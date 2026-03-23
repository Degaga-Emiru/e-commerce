'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Load cart from localStorage or Backend
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated && user?.role === 'CUSTOMER') {
        const response = await api.get('/cart');
        const backendItems = response.data.data.items.map((item: any) => ({
          productId: item.productId,
          name: item.productName,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productImage
        }));
        setCart(backendItems);
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync guest cart to backend after login
  useEffect(() => {
    const syncGuestCart = async () => {
      const savedCart = localStorage.getItem('cart');
      if (isAuthenticated && user?.role === 'CUSTOMER' && savedCart) {
        const guestItems: CartItem[] = JSON.parse(savedCart);
        if (guestItems.length > 0) {
          try {
            for (const item of guestItems) {
              await api.post('/cart/items', {
                productId: item.productId,
                quantity: item.quantity
              });
            }
            localStorage.removeItem('cart');
            fetchCart();
            toast.success('Your guest cart has been synced!');
          } catch (error) {
            console.error('Failed to sync guest cart:', error);
          }
        }
      }
    };
    syncGuestCart();
  }, [isAuthenticated, user, fetchCart]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (item: CartItem) => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      try {
        const response = await api.post('/cart/items', {
          productId: item.productId,
          quantity: item.quantity
        });
        const updatedItems = response.data.data.items.map((i: any) => ({
          productId: i.productId,
          name: i.productName,
          price: i.unitPrice,
          quantity: i.quantity,
          image: i.productImage
        }));
        setCart(updatedItems);
        toast.success('Added to cart');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        return [...prev, item];
      });
      toast.success('Added to cart');
    }
  };

  const removeFromCart = async (productId: number) => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      try {
        await api.delete(`/cart/items/${productId}`);
        setCart((prev) => prev.filter((i) => i.productId !== productId));
        toast.success('Removed from cart');
      } catch (error) {
        toast.error('Failed to remove item');
      }
    } else {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      try {
        const response = await api.put(`/cart/items/${productId}?quantity=${quantity}`);
        const updatedItems = response.data.data.items.map((i: any) => ({
          productId: i.productId,
          name: i.productName,
          price: i.unitPrice,
          quantity: i.quantity,
          image: i.productImage
        }));
        setCart(updatedItems);
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      try {
        await api.delete('/cart/clear');
        setCart([]);
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    } else {
      setCart([]);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
