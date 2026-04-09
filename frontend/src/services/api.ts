import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper methods for new services
export const shippingApi = {
  getShipping: (orderId: number) => api.get(`/shipping/order/${orderId}`),
  getHistory: (orderId: number) => api.get(`/shipping/order/${orderId}/history`),
  updateStatus: (orderId: number, data: { status: string; carrier?: string; trackingNumber?: string; note?: string }) => 
    api.put(`/shipping/order/${orderId}/status`, data),
};

export const escrowApi = {
  getEscrow: (orderId: number) => api.get(`/escrow/order/${orderId}`),
};

export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId: number) => api.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId: number) => api.delete(`/wishlist/${productId}`),
};

export const searchApi = {
  getHistory: () => api.get('/search-history'),
  clearHistory: () => api.delete('/search-history'),
  filterProducts: (params: any) => api.get('/products/filter', { params }),
};

export default api;
