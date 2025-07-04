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
} from '../controllers/user.controller.js';
import { verifyToken, requireAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', allUsers);
router.get('/profileListings', verifyToken, profileListings);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);
router.post('/save', verifyToken, saveListing);

// Admin routes
router.get('/admin', verifyToken, requireAdmin, getAllUsersAdmin);
router.get('/admin/stats', verifyToken, requireAdmin, getUserStats);
router.post('/admin', verifyToken, requireAdmin, createUserAdmin);
router.put('/admin/:id/role', verifyToken, requireAdmin, updateUserRole);
router.put('/admin/:id/ban', verifyToken, requireAdmin, toggleUserBan);

export default router;
