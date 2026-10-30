import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  RotateCcw
} from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const featured = searchParams.get('featured') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local price input state before applying
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSearch, setLocalSearch] = useState(search);

  // Synchronize local search state with URL query param
  useEffect(() => {
    setLocalSearch(search);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [search, minPrice, maxPrice]);

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on URL query parameters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
      };

      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStock) params.inStock = true;
      if (featured) params.featured = true;

      const res = await productApi.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, inStock, featured, sort, page]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateFilters = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || (k === 'category' && v === 'all')) {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    // Reset to page 1 on filter modification (unless page is specifically updated)
    if (!newParams.page) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: localSearch.trim() });
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    search || (category && category !== 'all') || minPrice || maxPrice || inStock || featured || sort !== 'newest'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {pagination.total} genuine gear and lifestyle products
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden btn-secondary text-sm py-2 px-3"
          >
            <Filter className="w-4 h-4 text-aqua" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-3 py-2 focus:border-aqua focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-4">
          <span className="text-xs font-medium text-gray-500">Active filters:</span>
          {search && (
            <span className="badge-aqua inline-flex items-center gap-1">
              Search: "{search}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ search: '' })} />
            </span>
          )}
          {category && category !== 'all' && (
            <span className="badge-aqua inline-flex items-center gap-1">
              Category: {categories.find((c) => c.slug === category)?.name || category}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ category: 'all' })} />
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="badge-aqua inline-flex items-center gap-1">
              Price: ₹{minPrice || '0'} - ₹{maxPrice || 'Any'}
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setLocalMinPrice(''); setLocalMaxPrice(''); updateFilters({ minPrice: '', maxPrice: '' }); }} />
            </span>
          )}
          {inStock && (
            <span className="badge-aqua inline-flex items-center gap-1">
              In Stock Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ inStock: '' })} />
            </span>
          )}
          {featured && (
            <span className="badge-orange inline-flex items-center gap-1">
              Featured Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ featured: '' })} />
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-red-500 hover:text-red-700 ml-2 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/60 h-fit sticky top-24 shadow-sm">
          {/* Keyword Search */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Search Catalog
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Product name, SKU..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-xl pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:border-aqua focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1.5 text-sm">
              <button
                onClick={() => updateFilters({ category: 'all' })}
                className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                  category === 'all'
                    ? 'bg-deep-teal text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    category === cat.slug
                      ? 'bg-deep-teal text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-xs opacity-75 font-mono">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Price Range (₹)
            </h3>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-1.5 text-gray-900 dark:text-gray-100 focus:border-aqua focus:outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-1.5 text-gray-900 dark:text-gray-100 focus:border-aqua focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full btn-secondary text-xs py-2 rounded-xl justify-center"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Availability & Featured Checkboxes */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 select-none">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : '' })}
                className="rounded text-deep-teal focus:ring-aqua h-4 w-4"
              />
              In Stock Only
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : '' })}
                className="rounded text-orange-accent focus:ring-orange-accent h-4 w-4"
              />
              Featured Picks Only
            </label>
          </div>
        </aside>

        {/* Products Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700 p-12 text-center space-y-4 shadow-sm my-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-mid/10 text-teal-mid dark:text-aqua mx-auto flex items-center justify-center">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                No matching products found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We couldn't find any products matching your specific search query and active filters. Try broadening your criteria or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="btn-primary text-sm px-5 py-2.5 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => updateFilters({ page: String(Math.max(1, pagination.page - 1)) })}
                    disabled={pagination.page <= 1}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === pagination.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilters({ page: String(pageNum) })}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-colors ${
                          isActive
                            ? 'bg-deep-teal text-white shadow-soft'
                            : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => updateFilters({ page: String(Math.min(pagination.pages, pagination.page + 1)) })}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-gray-900 h-full p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-aqua" />
                  Filter Products
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Category selector */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</h4>
                <select
                  value={category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl p-2.5"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price inputs */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range (₹)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-1/2 p-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-1/2 p-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : '' })}
                  />
                  In Stock Only
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : '' })}
                  />
                  Featured Only
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <button
                onClick={(e) => { handlePriceApply(e); setMobileFilterOpen(false); }}
                className="w-full btn-primary py-3 rounded-xl font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-red-500"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
