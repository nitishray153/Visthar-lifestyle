import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { successResponse } from '../utils/apiResponse.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(file, { folder: 'visthar-products' });
  successResponse(res, 'Image uploaded', { url: result.secure_url });
});

export default router;
