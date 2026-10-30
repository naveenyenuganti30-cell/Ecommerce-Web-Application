import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../../services/api';

const statusColors = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
  Processing: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
  Shipped: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-aqua',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl">
        {error || 'Unable to load statistics.'}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Revenue (Active)',
      value: `₹${Number(stats.totalSales).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Excludes cancelled orders',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} awaiting fulfillment`,
      icon: ShoppingBag,
      color: 'text-aqua',
      bgColor: 'bg-aqua/10'
    },
    {
      title: 'Active Products',
      value: stats.totalProducts,
      subtitle: `${stats.lowStockCount} items with low stock`,
      icon: Package,
      color: 'text-teal-mid dark:text-teal-300',
      bgColor: 'bg-teal-mid/10'
    },
    {
      title: 'Registered Customers',
      value: stats.totalCustomers,
      subtitle: 'Verified customer accounts',
      icon: Users,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm flex items-start justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {card.value}
                </div>
                <span className="text-xs text-gray-400 block pt-1">
                  {card.subtitle}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Status Grid Bar */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Order Status Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(stats.orderStatusMap || {}).map(([st, count]) => (
            <div
              key={st}
              className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 block">{st}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white mt-1 block">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Orders</h2>
              <p className="text-xs text-gray-400">Latest customer purchases</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-aqua hover:underline flex items-center gap-1"
            >
              View all orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
                <tr>
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Items</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {stats.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 font-mono font-bold text-gray-900 dark:text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold block">{ord.shippingAddress?.fullName}</span>
                      <span className="text-[10px] text-gray-400">{ord.shippingAddress?.city}</span>
                    </td>
                    <td className="py-3">{ord.items?.length || 0} item(s)</td>
                    <td className="py-3 font-bold text-deep-teal dark:text-aqua">
                      ₹{Number(ord.total).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          statusColors[ord.orderStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders?search=${ord.orderNumber}`}
                        className="text-aqua hover:underline font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base text-gray-900 dark:text-white">Low Stock Watch</h2>
            </div>
            <Link to="/admin/products?stockStatus=low" className="text-xs text-aqua hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {stats.lowStockProducts?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                All products currently have healthy inventory levels (&gt; 5 units).
              </p>
            ) : (
              stats.lowStockProducts?.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                      <span className="font-mono text-[10px] text-gray-400">{p.sku}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
