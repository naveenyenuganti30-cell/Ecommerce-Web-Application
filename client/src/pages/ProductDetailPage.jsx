import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  Shield,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
  AlertCircle
} from 'lucide-react';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try fetching by slug or ID
        let res;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          res = await productApi.getProductById(id);
          // If related products aren't fetched by ID, get by category
          if (res.data.success && res.data.product) {
            setProduct(res.data.product);
            const relRes = await productApi.getProducts({
              category: res.data.product.category?._id || res.data.product.category,
              limit: 4
            });
            if (relRes.data.success) {
              setRelatedProducts(relRes.data.products.filter((p) => p._id !== res.data.product._id));
            }
          }
        } else {
          res = await productApi.getProductBySlug(id);
          if (res.data.success) {
            setProduct(res.data.product);
            setRelatedProducts(res.data.relatedProducts || []);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError(err.response?.data?.message || 'Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setSelectedImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
      setActionMessage('');
    } else if (newQty > product.stock) {
      setActionMessage(`Only ${product.stock} units currently available in stock.`);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || adding) return;

    setAdding(true);
    setActionMessage('');
    const res = await addToCart(product, quantity);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setActionMessage(res.message);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Available</h2>
        <p className="text-sm text-gray-500">{error || 'This product might have been moved or is currently discontinued.'}</p>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Return to Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back button */}
      <nav>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-aqua transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main preview */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center justify-center">
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-orange-accent text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Featured Gear
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-aqua shadow-soft scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & SKU badges */}
            <div className="flex items-center justify-between">
              <span className="badge-aqua uppercase tracking-wider font-semibold">
                {product.category?.name || 'Category'}
              </span>
              <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                SKU: {product.sku}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock status */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-deep-teal dark:text-aqua">
                ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              {isOutOfStock ? (
                <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  Low Stock &bull; Only {product.stock} units left
                </span>
              ) : (
                <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  In Stock ({product.stock} units)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-light">
              <p>{product.description}</p>
            </div>

            {/* Stock Alert Warning if any */}
            {actionMessage && (
              <div className="p-3 rounded-xl bg-orange-accent/10 border border-orange-accent/20 text-orange-accent text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-gray-900 dark:text-white min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Max: {product.stock} units
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex-1 btn-primary py-3.5 rounded-xl font-semibold text-base shadow-soft"
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-400" />
                        Added to Cart!
                      </>
                    ) : adding ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 btn-accent py-3.5 rounded-xl font-semibold text-base shadow-soft"
                  >
                    Buy Now with COD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Value Props / Guarantees */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
              <Truck className="w-5 h-5 text-aqua mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                Express Delivery
              </span>
              <span className="text-[10px] text-gray-400">Doorstep within 2-4 days</span>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
              <Shield className="w-5 h-5 text-orange-accent mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                Genuine Product
              </span>
              <span className="text-[10px] text-gray-400">Full manufacturer warranty</span>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
              <RotateCcw className="w-5 h-5 text-aqua mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                7 Days Return
              </span>
              <span className="text-[10px] text-gray-400">Easy replacement guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Bought Together & Related Gear
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
