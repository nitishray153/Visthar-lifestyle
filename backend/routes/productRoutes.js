import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createProduct, deleteProduct, getProductById, getProducts, searchSuggestions, updateProduct } from '../controllers/productController.js';

const router = express.Router();
router.get('/', getProducts);
router.get('/suggestions', searchSuggestions);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
export default router;
