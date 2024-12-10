import express from 'express';
import {
  deleteUser,
  updateUser,
  singleUser,
  allUsers,
  saveListing,
  profileListings,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', allUsers);
//router.get('/:id', verifyToken, singleUser);
router.get('/profileListings', verifyToken, profileListings);

router.put('/:id', verifyToken, updateUser);

router.delete('/:id', verifyToken, deleteUser);

router.post('/save', verifyToken, saveListing);

export default router;
