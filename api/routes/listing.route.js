import express from 'express';
import {
  verifyToken,
  requireStaffOrAdmin,
  requireAdmin,
} from '../middleware/verifyToken.js';
import {
  addListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
  getAllListingsAdmin,
  approveListing,
  rejectListing,
  addListingReview,
  approveReview,
  getListingStats,
} from '../controllers/listing.controller.js';

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListing); // Supports both ID and slug

// Protected routes
router.post('/', verifyToken, addListing);
router.put('/:id', verifyToken, updateListing);
router.delete('/:id', verifyToken, deleteListing);
router.post('/reviews', verifyToken, addListingReview);

// Admin/Staff routes
router.get('/admin/all', verifyToken, requireStaffOrAdmin, getAllListingsAdmin);
router.get('/admin/stats', verifyToken, requireStaffOrAdmin, getListingStats);
router.put(
  '/admin/:id/approve',
  verifyToken,
  requireStaffOrAdmin,
  approveListing
);
router.put(
  '/admin/:id/reject',
  verifyToken,
  requireStaffOrAdmin,
  rejectListing
);
router.put(
  '/admin/reviews/:id/approve',
  verifyToken,
  requireStaffOrAdmin,
  approveReview
);

export default router;
