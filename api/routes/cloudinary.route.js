import express from 'express';
import {
  deleteImage,
  deleteBatchImages,
  getUploadSignature,
} from '../controllers/cloudinary.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Delete single image from Cloudinary
router.post('/delete', verifyToken, deleteImage);

// Delete multiple images from Cloudinary
router.post('/delete-batch', verifyToken, deleteBatchImages);

// Get signed upload parameters (optional - for secure uploads)
router.get('/upload-signature', verifyToken, getUploadSignature);

export default router;
