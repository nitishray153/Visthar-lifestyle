import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { deleteUserByAdmin, getProfile, getUsers, toggleWishlist, updateProfile, updateUserByAdmin } from '../controllers/userController.js';

const router = express.Router();
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/wishlist/:productId', protect, toggleWishlist);
router.get('/', protect, adminOnly, getUsers);
router.put('/:id', protect, adminOnly, updateUserByAdmin);
router.delete('/:id', protect, adminOnly, deleteUserByAdmin);
export default router;
