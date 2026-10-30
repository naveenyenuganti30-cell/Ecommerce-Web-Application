import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register failure
      const isAuthAttempt = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthAttempt) {
        localStorage.removeItem('shopsphere_token');
        localStorage.removeItem('shopsphere_user');
        // Dispatch custom event so AuthContext can sync immediately
        window.dispatchEvent(new Event('shopsphere_unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// Public catalog endpoints
export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
};

export const categoryApi = {
  getCategories: () => api.get('/categories'),
};

// Customer cart endpoints
export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateQuantity: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
  mergeGuestCart: (guestItems) => api.post('/cart/merge', { guestItems }),
};

// Customer orders endpoints
export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};

// Administrator endpoints
export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, note) => api.patch(`/admin/orders/${id}/status`, { status, note }),
  getCustomers: () => api.get('/admin/customers'),
};

export default api;
