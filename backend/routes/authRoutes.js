import express from 'express';
import { body } from 'express-validator';
import { loginUser, logoutUser, registerUser } from '../controllers/authController.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();
router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), validateRequest], registerUser);
router.post('/login', [body('email').isEmail(), body('password').notEmpty(), validateRequest], loginUser);
router.post('/logout', logoutUser);
export default router;
