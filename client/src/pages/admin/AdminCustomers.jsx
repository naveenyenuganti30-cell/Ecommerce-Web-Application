import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getCustomers();
        if (res.data.success) {
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Registered customer accounts, lifetime purchases, and account details
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No customers registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Qualifying Spend</th>
                  <th className="py-3 px-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-mid/10 text-teal-mid dark:text-aqua font-bold flex items-center justify-center">
                          {c.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{c.email}</td>
                    <td className="py-3 px-4 font-mono">{c.phone || '-'}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {c.orderCount} order(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-deep-teal dark:text-aqua">
                      ₹{Number(c.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
