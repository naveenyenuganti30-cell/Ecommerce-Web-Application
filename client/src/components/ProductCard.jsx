import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link to={`/products/${product.slug || product._id}`} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-orange-accent text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-red-600 text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Quick View Overlay icon */}
        <div className="absolute inset-0 bg-deep-teal/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-deep-teal dark:text-white flex items-center justify-center shadow-soft transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-5 h-5 text-deep-teal dark:text-aqua" />
          </span>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-teal-mid dark:text-aqua">
              {product.category?.name || 'Gear'}
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              {product.sku}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug || product._id}`}
            className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white hover:text-aqua transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 block leading-none mb-1">Price</span>
            <span className="text-lg sm:text-xl font-bold text-deep-teal dark:text-aqua">
              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || adding}
            aria-label={`Add ${product.name} to cart`}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-deep-teal text-white hover:bg-teal-mid active:scale-95 shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : adding ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
