import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { successResponse } from '../utils/apiResponse.js';

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit || 10); const page = Number(req.query.page || 1);
  const query = { ...(req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {}), ...(req.query.category ? { category: req.query.category } : {}), ...(req.query.minPrice || req.query.maxPrice ? { price: { ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}), ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}) } } : {}) };
  const count = await Product.countDocuments(query); const products = await Product.find(query).skip(pageSize*(page-1)).limit(pageSize);
  successResponse(res, 'Products fetched', { products, page, pages: Math.ceil(count / pageSize), total: count });
});
export const getProductById = asyncHandler(async (req,res)=> successResponse(res,'Product fetched',{ product: await Product.findById(req.params.id) }));
export const createProduct = asyncHandler(async (req,res)=> successResponse(res,'Product created',{ product: await Product.create({ ...req.body, createdBy: req.user._id }) },201));
export const updateProduct = asyncHandler(async (req,res)=> successResponse(res,'Product updated',{ product: await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
export const deleteProduct = asyncHandler(async (req,res)=> { await Product.findByIdAndDelete(req.params.id); await Review.deleteMany({ product: req.params.id }); successResponse(res,'Product deleted'); });
export const searchSuggestions = asyncHandler(async (req,res)=> successResponse(res,'Suggestions fetched',{ suggestions:(await Product.find({ name: { $regex: req.query.q || '', $options: 'i' } }).select('name').limit(8)).map(p=>p.name) }));
