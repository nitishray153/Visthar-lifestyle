import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { successResponse } from '../utils/apiResponse.js';

export const registerUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  const token = generateToken({ id: user._id, role: user.role });
  successResponse(res, 'User registered', { user, token }, 201);
});

export const loginUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) throw new Error('Invalid credentials');
  const token = generateToken({ id: user._id, role: user.role });
  successResponse(res, 'Login successful', { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
});

export const logoutUser = asyncHandler(async (_req, res) => successResponse(res, 'Logout successful'));
