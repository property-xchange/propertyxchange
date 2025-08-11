// server/routes/request.route.js
import express from 'express';
import {
  verifyToken,
  requireStaffOrAdmin,
  optionalAuth,
} from '../middleware/verifyToken.js';
import {
  createPropertyRequest,
  getPropertyRequests,
  getPropertyRequest,
  updatePropertyRequest,
  deletePropertyRequest,
  respondToRequest,
  getUserRequests,
  getRequestStats,
} from '../controllers/request.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getPropertyRequests); // Get all requests with filters
router.get('/:id', getPropertyRequest); // Get single request by ID or slug

// Semi-protected routes (authentication optional)
router.post('/', optionalAuth, createPropertyRequest); // Create request (can be done without login)

// Protected routes (authentication required)
router.put('/:id', verifyToken, updatePropertyRequest); // Update request
router.delete('/:id', verifyToken, deletePropertyRequest); // Delete request
router.post('/:requestId/respond', verifyToken, respondToRequest); // Respond to request
router.get('/user/my-requests', verifyToken, getUserRequests); // Get user's requests

// Admin/Staff routes
router.get('/admin/stats', verifyToken, requireStaffOrAdmin, getRequestStats);

export default router;
