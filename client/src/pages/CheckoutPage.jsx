import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';

const CheckoutPage = () => {
  const { cart, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.addressLine1.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.postalCode.trim()
    ) {
      setErrorMessage('Please fill in all required shipping address fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await orderApi.createOrder({
        shippingAddress,
        paymentMethod,
        idempotencyKey
      });

      if (res.data.success && res.data.order) {
        // Clear customer cart
        await clearCart();
        navigate(`/order-confirmation/${res.data.order.orderNumber}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to place order. Please review your cart and try again.'
      );
      // Revalidate cart in case stock changed concurrently
      refreshCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-aqua transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping Cart
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
        Secure Checkout
      </h1>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Checkout Incomplete:</span> {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Card */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Truck className="w-5 h-5 text-aqua" />
              1. Delivery & Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Street Address (Line 1) *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  placeholder="House/Flat number, building, street"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Apartment, Suite, Landmark (Line 2)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Optional additional address details"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  State / Province *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Karnataka"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="e.g. 560100"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-aqua focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-orange-accent" />
              2. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-deep-teal bg-deep-teal/5 dark:border-aqua dark:bg-aqua/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-deep-teal focus:ring-aqua"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      Cash on Delivery (COD)
                    </span>
                    <span className="badge-orange font-bold">Standard</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pay securely in cash or via mobile UPI at your doorstep upon receiving your package.
                  </p>
                </div>
              </label>

              {/* Online Payment (Verified Simulation / Gateway) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-deep-teal bg-deep-teal/5 dark:border-aqua dark:bg-aqua/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 text-deep-teal focus:ring-aqua"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-aqua" />
                      Online Payment (Instant Verification)
                    </span>
                    <span className="badge-aqua font-bold">Fast-Track</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Verified test mode checkout with automated instant payment authorization.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
              Order Review ({cart.itemCount} item{cart.itemCount > 1 ? 's' : ''})
            </h2>

            {/* Item list snapshot */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3 text-xs">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-gray-400">
                      Qty: {item.quantity} &times; ₹{Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    ₹{Number(item.lineTotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{Number(cart.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Doorstep Shipping</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {cart.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${Number(cart.shippingFee).toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-xl text-deep-teal dark:text-aqua">
                  ₹{Number(cart.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-accent py-4 rounded-xl font-bold text-base shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming Order & Reserving Stock...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Order &bull; ₹{Number(cart.total).toFixed(2)}
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              By confirming, your order will be reserved in MongoDB and inventory atomically decremented.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
