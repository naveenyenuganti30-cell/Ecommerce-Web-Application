import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (cart.items.length === 0) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-aqua/30 border-t-aqua rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Recalculating live cart with current database prices...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-teal-mid/10 text-teal-mid dark:text-aqua mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your shopping cart is empty
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Looks like you haven't added any products to your bag yet. Explore our genuine collection of electronics, audio gear, and lifestyle gear.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/catalog" className="btn-primary px-7 py-3.5 rounded-xl font-semibold">
            Explore Catalog
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 hover:text-red-700 inline-flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            const primaryImg = product.images && product.images.length > 0
              ? product.images[0]
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

            return (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                  <Link
                    to={`/products/${product.slug || product._id}`}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0"
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono uppercase text-gray-400">
                      {product.sku}
                    </span>
                    <Link
                      to={`/products/${product.slug || product._id}`}
                      className="block font-semibold text-gray-900 dark:text-white hover:text-aqua transition-colors text-sm sm:text-base line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Unit Price: ₹{Number(item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                  {/* Quantity buttons */}
                  <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-deep-teal dark:hover:text-aqua"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-deep-teal dark:hover:text-aqua disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5.5rem]">
                    <span className="text-base font-bold text-deep-teal dark:text-aqua">
                      ₹{Number(item.lineTotal).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4 flex justify-between items-center text-sm">
            <Link
              to="/catalog"
              className="text-aqua hover:underline font-semibold flex items-center gap-1.5"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{Number(cart.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {cart.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${Number(cart.shippingFee).toFixed(2)}`
                  )}
                </span>
              </div>

              {cart.subtotal < 500 && cart.subtotal > 0 && (
                <div className="p-2.5 rounded-xl bg-aqua/10 text-aqua text-xs">
                  Add <strong>₹{(500 - cart.subtotal).toFixed(2)}</strong> more to qualify for <strong>FREE shipping</strong>!
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Final Total</span>
                <span className="text-xl text-deep-teal dark:text-aqua">
                  ₹{Number(cart.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleCheckoutClick}
                className="w-full btn-accent py-3.5 rounded-xl font-bold text-base shadow-soft"
              >
                Proceed to Checkout &rarr;
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-gray-400">
              Default payment method: <strong>Cash on Delivery (COD)</strong>
            </div>
          </div>

          {/* Security & Guarantees */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-aqua flex-shrink-0" />
              <span>Authoritative database verified prices</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-aqua flex-shrink-0" />
              <span>Real-time stock deduction on confirmed orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
