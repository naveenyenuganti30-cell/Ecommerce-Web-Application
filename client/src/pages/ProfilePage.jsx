import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setSubmitting(true);
    const res = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 rounded-2xl bg-teal-mid/10 text-teal-mid dark:text-aqua flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-xs text-gray-400">
              Account Role:{' '}
              <span className="capitalize font-semibold text-aqua">
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
              />
              <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address (Permanent)
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              For security, email addresses cannot be altered directly.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Contact Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-3 px-6 rounded-xl font-semibold shadow-soft"
            >
              {submitting ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
