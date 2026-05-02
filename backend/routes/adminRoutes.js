import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/dashboard', protect, adminOnly, getDashboardStats);
export default router;
