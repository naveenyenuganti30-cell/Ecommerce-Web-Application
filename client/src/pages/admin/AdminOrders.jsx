import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Truck,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../../services/api';

const statusColors = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
  Processing: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
  Shipped: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-aqua',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400',
};

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 15 });

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Detail / Status Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminApi.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setSubmittingStatus(true);
    setAlert({ type: '', text: '' });

    try {
      const res = await adminApi.updateOrderStatus(selectedOrder._id, newStatus, statusNote);
      if (res.data.success) {
        setAlert({ type: 'success', text: `Order status changed to ${newStatus}` });
        setSelectedOrder(res.data.order);
        fetchOrders();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update order status.'
      });
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review customer purchases, inspect delivery addresses, and advance order pipeline states
          </p>
        </div>
      </div>

      {alert.text && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID, recipient name, or phone..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-aqua focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-aqua focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No orders found</p>
            <p className="text-xs text-gray-400">Try modifying your filter or search keywords</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block text-gray-900 dark:text-white">
                        {ord.shippingAddress?.fullName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{ord.items?.length || 0} product(s)</td>
                    <td className="py-3 px-4 font-bold text-deep-teal dark:text-aqua">
                      ₹{Number(ord.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="block font-medium">{ord.paymentMethod}</span>
                      <span className="text-[10px] text-gray-400">{ord.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          statusColors[ord.orderStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="btn-primary text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
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

      {/* Order Detail & Status Update Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto space-y-6 shadow-floating">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Order Management
                </span>
                <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Update Fulfillment Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-500 mb-1">New Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled (Restocks Inventory)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-500 mb-1">Status Note / Tracking ID</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Dispatched via Express Logistics"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aqua"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="btn-accent text-xs py-2 px-4 rounded-xl font-bold"
                >
                  {submittingStatus ? 'Updating Status...' : 'Apply Status Change'}
                </button>
              </div>
            </form>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Purchased Snapshot Items ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img src={item.productImageSnapshot} alt={item.productNameSnapshot} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block line-clamp-1">
                          {item.productNameSnapshot}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          Qty: {item.quantity} &times; ₹{Number(item.unitPriceSnapshot).toFixed(2)}
                        </span>
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
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-aqua" />
                Delivery Address
              </h3>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedOrder.shippingAddress?.fullName} &bull; {selectedOrder.shippingAddress?.phone}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedOrder.shippingAddress?.addressLine1}
                {selectedOrder.shippingAddress?.addressLine2 ? `, ${selectedOrder.shippingAddress?.addressLine2}` : ''},<br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode},{' '}
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            {/* Audit History */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-gray-500 uppercase tracking-wider">
                Status Transition Audit Log
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedOrder.statusHistory?.map((h, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-aqua mr-2">{h.status}</span>
                      <span className="text-gray-500">{h.note || 'No note attached'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(h.changedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
