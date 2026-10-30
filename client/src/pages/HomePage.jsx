import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Layers, Tag } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, newRes, catRes] = await Promise.all([
          productApi.getProducts({ featured: true, limit: 4 }),
          productApi.getProducts({ sort: 'newest', limit: 4 }),
          categoryApi.getCategories()
        ]);

        if (featRes.data.success) setFeaturedProducts(featRes.data.products);
        if (newRes.data.success) setNewArrivals(newRes.data.products);
        if (catRes.data.success) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-deep-teal-900 via-deep-teal to-teal-mid text-white">
        {/* Background glow graphics in Aqua and Orange Accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-aqua/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-orange-accent/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-medium text-aqua">
                <Sparkles className="w-4 h-4 text-orange-accent" />
                <span>Next-Gen Full-Stack E-Commerce Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Designed for precision. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua to-orange-accent">
                  Crafted for living.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                ShopSphere delivers curated acoustic headphones, intelligent tech peripherals, ergonomic workspace solutions, and active lifestyle essentials with seamless instant checkout.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/catalog"
                  className="btn-accent px-7 py-3.5 text-base font-semibold shadow-soft"
                >
                  Explore Catalog
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
                <Link
                  to="/catalog?featured=true"
                  className="px-6 py-3.5 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Featured Gear
                </Link>
              </div>

              {/* Highlights row */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-gray-300">Authentic Gear</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-aqua">Free</div>
                  <div className="text-xs text-gray-300">Delivery &gt; ₹500</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-accent">COD</div>
                  <div className="text-xs text-gray-300">Pay on Delivery</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 bg-deep-teal-950/40 aspect-[4/3] sm:aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                    alt="ShopSphere Studio Headphones"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-teal-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-accent">
                      Editor's Choice
                    </span>
                    <h3 className="text-xl font-bold text-white">Studio ANC Pro Headphones</h3>
                    <p className="text-sm text-gray-300">Pure acoustics &bull; 40h Battery &bull; ₹249.99</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-mid dark:text-aqua mb-1">
              <Layers className="w-4 h-4" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-sm font-semibold text-aqua hover:text-teal-mid dark:hover:text-aqua-300 flex items-center gap-1 group"
          >
            View all categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-4 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-aqua transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {cat.productCount !== undefined ? `${cat.productCount} Products` : 'Explore Gear'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-accent mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Staff Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Featured Products
            </h2>
          </div>
          <Link
            to="/catalog?featured=true"
            className="text-sm font-semibold text-aqua hover:text-teal-mid dark:hover:text-aqua-300 flex items-center gap-1 group"
          >
            Explore all featured
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-mid via-deep-teal to-deep-teal-900 text-white p-8 sm:p-12 shadow-floating border border-aqua/20">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-accent/20 border border-orange-accent/30 text-orange-accent text-xs font-bold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Special Introductory Offer</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Upgrade Your Setup with Free Express Shipping.
            </h3>
            <p className="text-sm sm:text-base text-gray-200 font-light leading-relaxed">
              Order any premium tech or lifestyle item above ₹500 today and receive complimentary express doorstep logistics and Cash on Delivery guarantee.
            </p>
            <div className="pt-2">
              <Link
                to="/catalog"
                className="btn-accent px-6 py-3 font-semibold shadow-soft"
              >
                Shop New Arrivals Now
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-aqua/10 blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-aqua mb-1">
              <Zap className="w-4 h-4" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/catalog?sort=newest"
            className="text-sm font-semibold text-aqua hover:text-teal-mid dark:hover:text-aqua-300 flex items-center gap-1 group"
          >
            See all new products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
