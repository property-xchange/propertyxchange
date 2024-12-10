import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  addListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from '../controllers/listing.controller.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', verifyToken, addListing);
router.put('/:id', verifyToken, updateListing);
router.delete('/:id', verifyToken, deleteListing);

export default router;
