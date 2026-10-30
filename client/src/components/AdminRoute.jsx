import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-accent/30 border-t-orange-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, message: 'Admin authentication required.' }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
