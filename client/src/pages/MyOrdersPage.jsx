import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  Clock,
  Eye,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { orderApi } from '../services/api';

const statusColors = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
  Processing: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
  Shipped: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-aqua',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400',
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to load your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-aqua/30 border-t-aqua rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading your purchase history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            My Order History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track deliveries, inspect invoices, and view order timelines
          </p>
        </div>

        <Link to="/catalog" className="btn-secondary text-sm self-start sm:self-auto">
          Shop More Gear &rarr;
        </Link>
      </div>

      {error && (
        <div className="my-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700 p-12 text-center space-y-4 shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-mid/10 text-teal-mid dark:text-aqua mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            No orders placed yet
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders with ShopSphere yet. Browse our catalog to find premium tech and lifestyle products.
          </p>
          <div className="pt-2">
            <Link to="/catalog" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm hover:shadow-card transition-all space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aqua/10 text-aqua flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className="block text-xs text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-lg font-bold text-deep-teal dark:text-aqua">
                    ₹{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items Snapshot Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                      <img
                        src={item.productImageSnapshot || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={item.productNameSnapshot}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-3">
                <div>
                  Payment: <strong>{order.paymentMethod === 'ONLINE' ? 'Online' : 'Cash on Delivery'}</strong> &bull;
                  Status: <strong>{order.paymentStatus}</strong>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Track & View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
