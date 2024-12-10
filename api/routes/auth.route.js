import express from 'express';
import {
  login,
  logout,
  register,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuth,
  resendVerificationEmail,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/verify-email', verifyEmail);

router.post('/resend-verification-email', resendVerificationEmail);

router.post('/forgot-password', forgetPassword);

router.post('/reset-password/:token', resetPassword);

export default router;
