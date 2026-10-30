import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shopsphere_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify current user profile with server on boot
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('shopsphere_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session verification failed:', err.response?.data?.message || err.message);
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('shopsphere_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('shopsphere_unauthorized', handleUnauthorized);
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('shopsphere_token', newToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message || 'Login failed' };
  };

  const register = async (name, email, password, phone) => {
    const res = await authApi.register({ name, email, password, phone });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('shopsphere_token', newToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue client cleanup regardless
    } finally {
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.data.success) {
      const updated = res.data.user;
      setUser(updated);
      localStorage.setItem('shopsphere_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }
    return { success: false, message: res.data.message };
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: !!user && user.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
