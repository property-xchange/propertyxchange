import express from 'express';
import {
  deleteUser,
  updateUser,
  singleUser,
  allUsers,
  saveListing,
  profileListings,
  getAllUsersAdmin,
  getUserStats,
  updateUserRole,
  toggleUserBan,
  createUserAdmin,
  deleteAdminSelf,
  deactivateAccount,
} from '../controllers/user.controller.js';
import { verifyToken, requireAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameterized routes
// Profile listings route - must come before /:id route
router.get('/profileListings', verifyToken, profileListings);

// Account management routes
router.delete('/admin/self', verifyToken, requireAdmin, deleteAdminSelf);
router.put('/:id/deactivate', verifyToken, deactivateAccount);

// Admin routes - these should also come before /:id
router.get('/admin', verifyToken, requireAdmin, getAllUsersAdmin);
router.get('/admin/stats', verifyToken, requireAdmin, getUserStats);
router.post('/admin', verifyToken, requireAdmin, createUserAdmin);
router.put('/admin/:id/role', verifyToken, requireAdmin, updateUserRole);
router.put('/admin/:id/ban', verifyToken, requireAdmin, toggleUserBan);

// General routes
router.get('/', allUsers);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser); // FIXED: Now correctly imports deleteUser
router.post('/save', verifyToken, saveListing);

// Single user route - MUST come after specific routes
router.get('/:id', singleUser);

export default router;
