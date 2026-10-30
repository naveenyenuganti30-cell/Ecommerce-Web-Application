import express from 'express';
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeAdmin, adminCreateCategory);
router.patch('/:id', authenticate, authorizeAdmin, adminUpdateCategory);
router.delete('/:id', authenticate, authorizeAdmin, adminDeleteCategory);

export default router;
