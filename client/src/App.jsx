import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Customer Storefront Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
    <h1 className="text-6xl font-extrabold text-deep-teal dark:text-aqua">404</h1>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
    <p className="text-sm text-gray-500 max-w-sm">
      The page you requested does not exist or may have been relocated.
    </p>
    <a href="/" className="btn-primary">
      Return Home
    </a>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderNumber"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Administrator Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>
    </Routes>
  );
}

export default App;
