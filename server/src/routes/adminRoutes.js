import express from 'express';
import {
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAllCustomers
} from '../controllers/adminController.js';
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Require both authentication and admin role for all routes in this router
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Products
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.post('/categories', adminCreateCategory);
router.patch('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getAllCustomers);

export default router;
