import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Order from '../models/Order.js';
import razorpay from '../config/razorpay.js';
import { successResponse } from '../utils/apiResponse.js';

export const placeOrder = asyncHandler(async (req, res) => successResponse(res, 'Order placed', { order: await Order.create({ ...req.body, user: req.user._id }) }, 201));
export const getMyOrders = asyncHandler(async (req, res) => successResponse(res, 'Orders fetched', { orders: await Order.find({ user: req.user._id }).sort('-createdAt') }));
export const getOrderById = asyncHandler(async (req, res) => successResponse(res, 'Order details fetched', { order: await Order.findById(req.params.id).populate('user', 'name email') }));
export const getAllOrders = asyncHandler(async (_req, res) => successResponse(res, 'All orders fetched', { orders: await Order.find().populate('user', 'name').sort('-createdAt') }));
export const updateOrderStatus = asyncHandler(async (req, res) => { const order = await Order.findById(req.params.id); Object.assign(order, req.body); if (req.body.isPaid) order.paidAt = new Date(); if (req.body.isDelivered) order.deliveredAt = new Date(); await order.save(); successResponse(res, 'Order status updated', { order }); });

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const rpOrder = await razorpay.orders.create({ amount: Number(req.body.amount) * 100, currency: 'INR', receipt: `visthar_${Date.now()}` });
  successResponse(res, 'Razorpay order created', { order: rpOrder });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (generated !== razorpay_signature) throw new Error('Invalid payment signature');
  const order = await Order.findById(orderId);
  order.isPaid = true; order.status = 'paid'; order.paidAt = new Date(); order.paymentResult = { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }; await order.save();
  successResponse(res, 'Payment verified', { order });
});
