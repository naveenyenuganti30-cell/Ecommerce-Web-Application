import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  MapPin,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { orderApi } from '../services/api';

const TRACKING_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrderById(id);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || 'Order not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(order._id, cancelReason);
      if (res.data.success) {
        setOrder(res.data.order);
        setCancelModalOpen(false);
        setActionSuccess('Order has been cancelled and stock returned to inventory.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-aqua/30 border-t-aqua rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Retrieving real-time order tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h2>
        <p className="text-sm text-gray-500">{error || 'Could not find the requested order record.'}</p>
        <Link to="/orders" className="btn-primary inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStepIndex = TRACKING_STEPS.indexOf(order.orderStatus);
  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation */}
      <nav className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-aqua transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>

        {canCancel && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-aqua block mb-1">
            Order Status Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-mono">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isCancelled
                ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                : 'bg-aqua/10 text-aqua'
            }`}
          >
            {order.orderStatus}
          </span>
          <span className="block text-xl font-bold text-deep-teal dark:text-white mt-1">
            ₹{Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Timeline Visualizer */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Fulfillment Journey
        </h2>

        {isCancelled ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center gap-4">
            <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-300 text-base">This Order Has Been Cancelled</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                The order items were returned to inventory. No payment or fulfillment actions will take place.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pt-4 pb-2">
            {/* Steps indicator bar */}
            <div className="grid grid-cols-5 gap-2 text-center relative z-10">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isCurrent
                          ? 'bg-orange-accent text-white ring-4 ring-orange-accent/20'
                          : isPassed
                          ? 'bg-deep-teal text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent
                          ? 'text-orange-accent font-bold'
                          : isPassed
                          ? 'text-gray-900 dark:text-white font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Status History Log */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Audit Status History
          </h3>
          <div className="space-y-4">
            {order.statusHistory?.map((hist, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-aqua mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{hist.status}</span>
                    <span className="text-gray-400 font-mono">
                      {new Date(hist.changedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {hist.note && (
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">{hist.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping & Purchased Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping address card */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-2 text-sm">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-aqua" />
            Shipping Destination
          </h3>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Phone: {order.shippingAddress.phone}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Payment summary card */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-2 text-sm">
          <h3 className="font-bold text-gray-900 dark:text-white">Payment & Charges</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Payment Mode:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {order.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery (COD)'}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment Status:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${Number(order.shippingFee).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total Payable:</span>
              <span className="text-deep-teal dark:text-aqua">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4 shadow-floating">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
              Cancel Order {order.orderNumber}?
            </h3>
            <p className="text-xs text-gray-500 text-center">
              Are you sure you want to cancel this order? Reserved items will be returned to store inventory.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Changed my mind, ordered by mistake, etc."
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs dark:bg-gray-800 focus:outline-none focus:border-aqua"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 btn-secondary text-xs py-2.5 rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-red-700 transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
