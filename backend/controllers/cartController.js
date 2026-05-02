import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import { successResponse } from '../utils/apiResponse.js';

const ensureCart = async (userId) => (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });

export const getCart = asyncHandler(async (req, res) => successResponse(res, 'Cart fetched', { cart: await (await ensureCart(req.user._id)).populate('items.product') }));
export const addToCart = asyncHandler(async (req, res) => { const cart = await ensureCart(req.user._id); const item = cart.items.find((i)=> i.product.toString() === req.body.productId); if(item) item.quantity += req.body.quantity || 1; else cart.items.push({ product: req.body.productId, quantity: req.body.quantity || 1}); await cart.save(); successResponse(res, 'Item added to cart', { cart }); });
export const updateCartItem = asyncHandler(async (req, res) => { const cart = await ensureCart(req.user._id); const item = cart.items.find((i)=> i.product.toString()===req.params.productId); if(!item) throw new Error('Cart item not found'); item.quantity = req.body.quantity; await cart.save(); successResponse(res,'Cart updated',{ cart }); });
export const removeCartItem = asyncHandler(async (req, res) => { const cart = await ensureCart(req.user._id); cart.items = cart.items.filter((i)=> i.product.toString() !== req.params.productId); await cart.save(); successResponse(res,'Item removed',{ cart }); });
