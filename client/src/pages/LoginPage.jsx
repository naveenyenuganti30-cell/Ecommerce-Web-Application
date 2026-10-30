import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.message || '');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (res.user.role === 'admin' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setErrorMessage(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800/90 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-8 sm:p-10 shadow-soft space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-deep-teal to-aqua flex items-center justify-center text-white mx-auto shadow-soft">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign In to ShopSphere
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Access your shopping cart, orders, and personalized settings
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-mid dark:text-aqua">
            <Shield className="w-3.5 h-3.5" />
            <span>One-Click Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@shopsphere.com', 'Customer@123')}
              className="py-1.5 px-2 rounded-lg bg-deep-teal/10 hover:bg-deep-teal/20 text-deep-teal dark:text-aqua text-xs font-semibold text-center transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@shopsphere.com', 'Admin@123')}
              className="py-1.5 px-2 rounded-lg bg-orange-accent/10 hover:bg-orange-accent/20 text-orange-accent text-xs font-semibold text-center transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-aqua focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:border-aqua focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 rounded-xl font-bold text-sm shadow-soft"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-aqua font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
