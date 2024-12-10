import express from 'express';
import { isAdmin, isLoggedIn } from '../controllers/test.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/is-admin', verifyToken, isAdmin);

router.get('/is-logged-in', isLoggedIn);

export default router;
