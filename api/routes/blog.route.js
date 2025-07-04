import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createComment,
  approveComment,
  deleteComment,
  getAllComments,
  getCommentStats,
} from '../controllers/blog.controller.js';
import {
  verifyToken,
  requireStaffOrAdmin,
  requireAdmin,
  requireUser,
} from '../middleware/verifyToken.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/categories', getAllCategories);

// Protected routes for authenticated users
router.post('/comments', verifyToken, requireUser, createComment);

// Staff/Admin routes
router.get('/admin', verifyToken, requireStaffOrAdmin, getAllBlogsAdmin);
router.post('/', verifyToken, requireStaffOrAdmin, createBlog);
router.put('/:id', verifyToken, requireStaffOrAdmin, updateBlog);
router.delete('/:id', verifyToken, requireStaffOrAdmin, deleteBlog);

// Admin only routes
router.post('/categories', verifyToken, requireAdmin, createCategory);
router.put('/categories/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/categories/:id', verifyToken, requireAdmin, deleteCategory);
router.put(
  '/comments/:id/approve',
  verifyToken,
  requireStaffOrAdmin,
  approveComment
);
router.get('/comments', verifyToken, requireStaffOrAdmin, getAllComments);
router.get(
  '/comments/stats',
  verifyToken,
  requireStaffOrAdmin,
  getCommentStats
);
router.delete('/comments/:id', verifyToken, requireStaffOrAdmin, deleteComment);

export default router;
