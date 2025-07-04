// controllers/cloudinary.controller.js
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../lib/prisma.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete single image from Cloudinary
export const deleteImage = async (req, res) => {
  const { publicId } = req.body;
  const tokenUserId = req.userId;

  try {
    // Validate input
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    // Optional: Check if user has permission to delete this image
    // You can implement this based on your business logic
    // For example, check if the image belongs to a listing owned by the user
    /*
    const listing = await prisma.listing.findFirst({
      where: {
        userId: tokenUserId,
        images: {
          has: publicId // if you store public IDs in the images array
        }
      }
    });

    if (!listing) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this image' 
      });
    }
    */

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    // Check deletion result
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        result: result,
      });
    } else if (result.result === 'not found') {
      res.status(200).json({
        success: true,
        message: 'Image not found (may have been already deleted)',
        result: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image',
        result: result,
      });
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image from cloud storage',
      error: error.message,
    });
  }
};

// Delete multiple images from Cloudinary
export const deleteBatchImages = async (req, res) => {
  const { publicIds } = req.body;
  const tokenUserId = req.userId;

  try {
    // Validate input
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of public IDs is required',
      });
    }

    // Limit batch size to prevent abuse
    if (publicIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 images can be deleted at once',
      });
    }

    // Optional: Check user permissions for all images
    /*
    const listings = await prisma.listing.findMany({
      where: {
        userId: tokenUserId,
        images: {
          hasSome: publicIds
        }
      }
    });

    if (listings.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete these images' 
      });
    }
    */

    // Delete multiple images
    const results = await Promise.allSettled(
      publicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
      )
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (
        result.status === 'fulfilled' &&
        (result.value.result === 'ok' || result.value.result === 'not found')
      ) {
        successful.push(publicIds[index]);
      } else {
        failed.push({
          publicId: publicIds[index],
          error:
            result.reason?.message || result.value?.result || 'Unknown error',
        });
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${successful.length} images, ${failed.length} failed`,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Batch deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete images from cloud storage',
      error: error.message,
    });
  }
};

// Get signed upload parameters for secure uploads (optional)
export const getUploadSignature = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // You can add additional parameters here
    const params = {
      timestamp: timestamp,
      folder: 'listings', // or any folder structure you want
      // max_file_size: 2000000, // 2MB
      // allowed_formats: 'jpg,jpeg,png,gif,webp'
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: params.folder,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      error: error.message,
    });
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  try {
    const regex =
      /\/(?:v\d+\/)?([^\/]+)\.(?:jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i;
    const match = url.match(regex);

    if (match) {
      return match[1];
    }

    // Alternative extraction for more complex URLs
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const publicId = lastPart.split('.')[0];

    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Helper function to check if user owns a listing with specific images
export const checkImageOwnership = async (userId, publicIds) => {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        userId: userId,
        images: {
          hasSome: publicIds, // Assuming images field stores array of URLs or public IDs
        },
      },
    });

    return listings.length > 0;
  } catch (error) {
    console.error('Error checking image ownership:', error);
    return false;
  }
};
