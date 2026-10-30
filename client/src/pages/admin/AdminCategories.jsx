import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { categoryApi, adminApi } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ type: '', text: '' });

    try {
      let res;
      if (editingCategory) {
        res = await adminApi.updateCategory(editingCategory._id, formData);
      } else {
        res = await adminApi.createCategory(formData);
      }

      if (res.data.success) {
        setAlert({
          type: 'success',
          text: editingCategory ? 'Category updated successfully.' : 'New category created successfully.'
        });
        setModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save category.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete category "${cat.name}"?`);
    if (!confirmDelete) return;

    try {
      const res = await adminApi.deleteCategory(cat._id);
      if (res.data.success) {
        setAlert({ type: 'success', text: res.data.message });
        fetchCategories();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete category.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Category Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize catalog groupings, descriptions, and cover imagery
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-soft"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {alert.text && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Categories Grid Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading categories...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Active Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    {c.image && (
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                    )}
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-400">{c.slug}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-gray-500">{c.description || '-'}</td>
                  <td className="py-3 px-4 font-bold text-aqua">
                    {c.productCount || 0} product(s)
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-deep-teal dark:text-aqua hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4 shadow-floating">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Audio & Sound"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this category..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                />
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
                  className="btn-primary py-2.5 px-5 rounded-xl text-xs font-semibold"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
