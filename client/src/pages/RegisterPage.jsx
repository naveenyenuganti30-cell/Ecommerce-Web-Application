import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, phone.trim());
    setSubmitting(false);

    if (res.success) {
      navigate('/catalog');
    } else {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800/90 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-8 sm:p-10 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-deep-teal to-aqua flex items-center justify-center text-white mx-auto shadow-soft">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Join ShopSphere for faster checkout, order tracking, and member offers
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-aqua focus:outline-none"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address *
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
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-aqua focus:outline-none"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Password (Min 6 characters) *
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
              className="w-full btn-accent py-3 rounded-xl font-bold text-sm shadow-soft"
            >
              {submitting ? 'Creating Account...' : 'Register Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Already have an account?{' '}
          <Link to="/login" className="text-aqua font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
