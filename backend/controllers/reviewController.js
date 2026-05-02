import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import { successResponse } from '../utils/apiResponse.js';
import recalcRatings from '../utils/calcProductRatings.js';

export const addReview = asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, user: req.user._id, product: req.params.productId });
  await recalcRatings(req.params.productId);
  successResponse(res, 'Review added', { review }, 201);
});

export const getProductReviews = asyncHandler(async (req, res) => successResponse(res, 'Reviews fetched', { reviews: await Review.find({ product: req.params.productId }).populate('user', 'name') }));
