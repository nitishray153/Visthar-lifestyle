import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { successResponse } from '../utils/apiResponse.js';

export const getProfile = asyncHandler(async (req, res) => successResponse(res, 'Profile fetched', { user: req.user }));
export const updateProfile = asyncHandler(async (req, res) => { const user = await User.findById(req.user._id); Object.assign(user, req.body); await user.save(); successResponse(res, 'Profile updated', { user }); });
export const getUsers = asyncHandler(async (_req, res) => successResponse(res, 'Users fetched', { users: await User.find() }));
export const updateUserByAdmin = asyncHandler(async (req, res) => { const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); successResponse(res, 'User updated', { user }); });
export const deleteUserByAdmin = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); successResponse(res, 'User deleted'); });
export const toggleWishlist = asyncHandler(async (req, res) => { const user = await User.findById(req.user._id); const idx = user.wishlist.findIndex((p) => p.toString() === req.params.productId); if (idx > -1) user.wishlist.splice(idx,1); else user.wishlist.push(req.params.productId); await user.save(); successResponse(res, 'Wishlist updated', { wishlist: user.wishlist }); });
