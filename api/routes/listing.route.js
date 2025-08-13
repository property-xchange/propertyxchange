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
  getAllReviews,
  approveReview,
  deleteReview,
  getListingReviews,
  getReviewStats,
  getListingStats,
  getFeaturedListings,
  toggleFeatured,
} from '../controllers/listing.controller.js';

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameterized routes
// Featured listings route - must come before /:id route
router.get('/featured', getFeaturedListings);

// Admin/Staff routes - these should also come before /:id
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
  '/admin/:id/featured',
  verifyToken,
  requireStaffOrAdmin,
  toggleFeatured
);

// Review management routes (Admin/Staff)
router.get('/admin/reviews', verifyToken, requireStaffOrAdmin, getAllReviews);
router.get(
  '/admin/reviews/stats',
  verifyToken,
  requireStaffOrAdmin,
  getReviewStats
);
router.put(
  '/admin/reviews/:id/approve',
  verifyToken,
  requireStaffOrAdmin,
  approveReview
);
router.delete(
  '/admin/reviews/:id',
  verifyToken,
  requireStaffOrAdmin,
  deleteReview
);

// Public review routes
router.get('/:listingId/reviews', getListingReviews);

// Public routes
router.get('/', getListings);
router.get('/:id', getListing); // Supports both ID and slug - MUST come after specific routes

// Protected routes
router.post('/', verifyToken, addListing);
router.put('/:id', verifyToken, updateListing);
router.delete('/:id', verifyToken, deleteListing);
router.post('/reviews', verifyToken, addListingReview);

export default router;
