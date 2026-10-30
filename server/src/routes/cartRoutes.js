import express from 'express';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  mergeGuestCart
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItemQuantity);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);
router.post('/merge', mergeGuestCart);

export default router;
