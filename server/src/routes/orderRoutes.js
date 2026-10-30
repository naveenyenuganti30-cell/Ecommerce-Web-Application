import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

export default router;
