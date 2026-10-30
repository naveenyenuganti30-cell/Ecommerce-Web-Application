import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminApi, categoryApi } from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 15 });

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [page, setPage] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stock: '',
    images: '',
    featured: false,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

  // Load Categories
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

  // Load Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (stockStatus !== 'all') params.stockStatus = stockStatus;

      const res = await adminApi.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, stockStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0]?._id || '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: '20',
      images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      featured: false,
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: prod.category?._id || prod.category,
      sku: prod.sku,
      stock: prod.stock,
      images: Array.isArray(prod.images) ? prod.images.join(', ') : prod.images,
      featured: Boolean(prod.featured),
      isActive: Boolean(prod.isActive)
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMessage({ type: '', text: '' });

    try {
      const imageList = formData.images
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        sku: formData.sku.toUpperCase(),
        stock: Number(formData.stock),
        images: imageList.length > 0 ? imageList : undefined,
        featured: formData.featured,
        isActive: formData.isActive
      };

      let res;
      if (editingProduct) {
        res = await adminApi.updateProduct(editingProduct._id, payload);
      } else {
        res = await adminApi.createProduct(payload);
      }

      if (res.data.success) {
        setAlertMessage({
          type: 'success',
          text: editingProduct ? 'Product updated successfully.' : 'New product created successfully.'
        });
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      setAlertMessage({
        type: 'error',
        text: err.response?.data?.message || 'Operation failed. Please check form values.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prod) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete or deactivate "${prod.name}"? If historical orders reference it, it will be safely deactivated.`
    );
    if (!confirmDelete) return;

    try {
      const res = await adminApi.deleteProduct(prod._id);
      if (res.data.success) {
        setAlertMessage({ type: 'success', text: res.data.message });
        fetchProducts();
      }
    } catch (err) {
      setAlertMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete product.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create, update, manage prices, and adjust inventory quantities
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-soft"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {alertMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by product name or SKU..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-aqua focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-aqua focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-aqua focus:outline-none"
          >
            <option value="all">All Inventory</option>
            <option value="in">In Stock (&gt; 5)</option>
            <option value="low">Low Stock (&le; 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No products found</p>
            <p className="text-xs text-gray-400">Try modifying your search or filter options</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {products.map((p) => {
                  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80';
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-semibold text-gray-900 dark:text-white truncate block">
                              {p.name}
                            </span>
                            {p.featured && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-accent/10 text-orange-accent">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">{p.sku}</td>
                      <td className="py-3 px-4">{p.category?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 font-bold text-deep-teal dark:text-aqua">
                        ₹{Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock <= 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-deep-teal dark:text-aqua hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            title="Delete or Deactivate"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total products)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                disabled={page >= pagination.pages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto space-y-4 shadow-floating">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ShopSphere Studio Wireless Headphones"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of product features..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. AUD-001"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Stock Inventory *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Product Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..., https://..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-orange-accent focus:ring-orange-accent"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-deep-teal focus:ring-aqua"
                  />
                  <span>Product is Active (Public)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary py-2.5 px-4 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2.5 px-5 rounded-xl text-xs font-semibold shadow-soft"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
