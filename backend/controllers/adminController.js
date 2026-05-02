import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalOrders, productCount, revenueAgg] = await Promise.all([
    User.countDocuments(), Order.countDocuments(), Product.countDocuments(), Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }])
  ]);
  successResponse(res, 'Dashboard stats fetched', { totalUsers, totalOrders, productCount, totalRevenue: revenueAgg[0]?.totalRevenue || 0 });
});
