import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
  Calendar
} from 'lucide-react';
import { orderApi } from '../services/api';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrderById(orderNumber);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
        setError('Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-aqua/30 border-t-aqua rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Retrieving confirmed order record...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Record Not Found</h2>
        <p className="text-sm text-gray-500">Please check your account orders page.</p>
        <Link to="/orders" className="btn-primary inline-flex">
          Go to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-8 sm:p-10 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="badge-orange font-bold uppercase tracking-wider text-xs">
          Order Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Thank you for your order!
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Your order has been placed in our system and stock has been reserved. A confirmation summary has been registered to your account.
        </p>

        <div className="pt-2 inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-mono text-deep-teal dark:text-aqua font-bold">
          Order ID: {order.orderNumber}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700 text-sm">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Date Placed</span>
            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-aqua" />
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block mb-1">Payment Method</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {order.paymentMethod === 'ONLINE' ? 'Online Payment (Verified)' : 'Cash on Delivery (COD)'}
            </span>
            <span className="block text-xs text-gray-400">Status: {order.paymentStatus}</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block mb-1">Current Order Status</span>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-aqua/10 text-aqua">
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Ordered items preview */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
            Purchased Items ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                    <img
                      src={item.productImageSnapshot || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                      alt={item.productNameSnapshot}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {item.productNameSnapshot}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity} &times; ₹{Number(item.unitPriceSnapshot).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{Number(item.lineTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-aqua" />
            Shipping Destination
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>{order.shippingAddress.fullName}</strong> &bull; {order.shippingAddress.phone}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''},{' '}
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode},{' '}
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `₹${Number(order.shippingFee).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Total Payable</span>
            <span className="text-lg text-deep-teal dark:text-aqua">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Link
          to={`/orders/${order.orderNumber}`}
          className="btn-primary py-3.5 px-6 rounded-xl font-semibold shadow-soft"
        >
          <Package className="w-4 h-4" />
          Track Order Live
        </Link>
        <Link
          to="/catalog"
          className="btn-secondary py-3.5 px-6 rounded-xl font-semibold"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
