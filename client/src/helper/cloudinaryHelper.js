import apiRequest from './apiRequest.js';

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Public ID
 */
export const extractPublicIdFromUrl = (url) => {
  try {
    // Handle different Cloudinary URL formats
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

/**
 * Delete image from Cloudinary using your backend API
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await apiRequest.post('/cloudinary/delete', {
      publicId,
    });

    return response.data.success;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Delete multiple images from Cloudinary using your backend API
 * @param {string[]} publicIds - Array of public IDs to delete
 * @returns {Promise<{successful: string[], failed: Object[]}>} - Deletion results
 */
export const deleteBatchFromCloudinary = async (publicIds) => {
  try {
    const response = await apiRequest.post('/cloudinary/delete-batch', {
      publicIds,
    });

    return {
      successful: response.data.successful || [],
      failed: response.data.failed || [],
    };
  } catch (error) {
    console.error('Error batch deleting from Cloudinary:', error);
    return {
      successful: [],
      failed: publicIds.map((id) => ({
        publicId: id,
        error: 'API request failed',
      })),
    };
  }
};

/**
 * Delete image by URL (extracts public ID and deletes)
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImageByUrl = async (imageUrl) => {
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) {
    console.error('Could not extract public ID from URL:', imageUrl);
    return false;
  }

  return await deleteFromCloudinary(publicId);
};

/**
 * Validate if URL is a valid Cloudinary URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (url, transformations = {}) => {
  if (!isCloudinaryUrl(url)) return url;

  const {
    width = 300,
    height = 200,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = transformations;

  try {
    // Insert transformations into the URL
    const transformString = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
    const urlParts = url.split('/upload/');

    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/${transformString}/${urlParts[1]}`;
    }

    return url;
  } catch (error) {
    console.error('Error creating optimized URL:', error);
    return url;
  }
};

/**
 * Get upload signature from your backend (for secure uploads)
 * @returns {Promise<Object>} - Upload signature and parameters
 */
export const getUploadSignature = async () => {
  try {
    const response = await apiRequest.get('/cloudinary/upload-signature');
    return response.data;
  } catch (error) {
    console.error('Error getting upload signature:', error);
    throw new Error('Failed to get upload signature');
  }
};
