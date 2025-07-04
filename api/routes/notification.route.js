import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/:id/read', verifyToken, markNotificationAsRead);
router.put('/read-all', verifyToken, markAllNotificationsAsRead);

export default router;
