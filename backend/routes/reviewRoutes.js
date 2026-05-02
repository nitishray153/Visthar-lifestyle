import express from 'express';
import { body } from 'express-validator';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();
router.get('/:productId', getProductReviews);
router.post('/:productId', protect, [body('rating').isInt({ min: 1, max: 5 }), body('comment').notEmpty(), validateRequest], addReview);
export default router;
