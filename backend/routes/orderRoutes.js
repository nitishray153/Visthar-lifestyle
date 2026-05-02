import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createRazorpayOrder, getAllOrders, getMyOrders, getOrderById, placeOrder, updateOrderStatus, verifyRazorpayPayment } from '../controllers/orderController.js';

const router = express.Router();
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.post('/payment/create', protect, createRazorpayOrder);
router.post('/payment/verify', protect, verifyRazorpayPayment);
export default router;
