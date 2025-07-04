import { BsYoutube } from 'react-icons/bs';
import { BiLogoInstagramAlt } from 'react-icons/bi';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { Upload, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UploadWidget from '../../../common/page-components/UploadWidget.jsx';
import {
  extractPublicIdFromUrl,
  deleteFromCloudinary,
  isCloudinaryUrl,
  getOptimizedUrl,
} from '../../../../helper/cloudinaryHelper.js';
import toast from 'react-hot-toast';

const MediaStep = ({
  images,
  setImages,
  formData,
  handleInstagramChange,
  handleYouTubeChange,
  instagramLinkErr,
  youTubeLinkErr,
}) => {
  const [deletingImages, setDeletingImages] = useState(new Set());

  // Cloudinary configuration - replace with your actual config
  const uwConfig = {
    cloudName: 'propertyxchange',
    uploadPreset: 'estate',
    multiple: true,
    maxImageFileSize: 2000000,
    maxFiles: 14,
    folder: 'post',
    sources: ['local', 'url', 'camera'],
    showAdvancedOptions: true,
    cropping: true,
    croppingAspectRatio: 1.5,
    croppingValidateDimensions: true,
    resourceType: 'image',
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxImageWidth: 2000,
    maxImageHeight: 2000,
    theme: 'white',
    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#90A0B3',
        tabIcon: '#0078FF',
        menuIcons: '#5A616A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0078FF',
        action: '#FF620C',
        inactiveTabIcon: '#0E2F5A',
        error: '#F44235',
        inProgress: '#0078FF',
        complete: '#20B832',
        sourceBg: '#E4EBF1',
      },
    },
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = images[indexToRemove];

    if (!imageUrl) return;

    // Add to deleting state to show loading
    setDeletingImages((prev) => new Set([...prev, indexToRemove]));

    try {
      // Check if it's a Cloudinary URL and attempt to delete from Cloudinary
      if (isCloudinaryUrl(imageUrl)) {
        const publicId = extractPublicIdFromUrl(imageUrl);

        if (publicId) {
          // Attempt to delete from Cloudinary
          const deleted = await deleteFromCloudinary(
            publicId,
            uwConfig.cloudName
          );

          if (!deleted) {
            // If deletion fails, show warning but still remove from state
            toast.error(
              'Warning: Could not delete image from cloud storage, but removed from listing'
            );
            console.warn('Failed to delete image from Cloudinary:', publicId);
          } else {
            toast.success('Image deleted successfully');
          }
        }
      }

      // Remove from local state regardless of Cloudinary deletion status
      setImages(images.filter((_, index) => index !== indexToRemove));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error deleting image, but removed from listing');
      // Still remove from state even if deletion fails
      setImages(images.filter((_, index) => index !== indexToRemove));
    } finally {
      // Remove from deleting state
      setDeletingImages((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(indexToRemove);
        return newSet;
      });
    }
  };

  const clearAllImages = async () => {
    if (images.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove all ${images.length} images? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingImages(new Set(images.map((_, index) => index)));

    try {
      // Attempt to delete all Cloudinary images
      const deletePromises = images.map(async (imageUrl, index) => {
        if (isCloudinaryUrl(imageUrl)) {
          const publicId = extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            return deleteFromCloudinary(publicId, uwConfig.cloudName);
          }
        }
        return true;
      });

      await Promise.allSettled(deletePromises);

      setImages([]);
      setDeletingImages(new Set());
      toast.success('All images removed');
    } catch (error) {
      console.error('Error clearing images:', error);
      // Clear state regardless of deletion status
      setImages([]);
      setDeletingImages(new Set());
      toast.error(
        'Images removed from listing (some may still exist in cloud storage)'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Property Images *
          </label>
          {images.length > 0 && (
            <button
              type="button"
              onClick={clearAllImages}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Upload Widget */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Upload property images (max 14 images, 2MB each)
              </p>
              <UploadWidget uwConfig={uwConfig} setState={setImages} />
            </div>
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {14 - images.length} remaining
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative group">
                  <img
                    src={getOptimizedUrl(image, { width: 300, height: 200 })}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-opacity group-hover:opacity-75"
                    loading="lazy"
                  />

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={deletingImages.has(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingImages.has(index) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RiDeleteBin5Fill size={16} />
                    )}
                  </button>

                  {/* Thumbnail Badge */}
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Thumbnail
                    </span>
                  )}

                  {/* Image Index */}
                  <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The first image will be used as the property thumbnail
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag images to reorder them (feature can be added later)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Instagram Link (Optional)
          </label>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <BiLogoInstagramAlt className="text-2xl text-pink-500 flex-shrink-0" />
            <input
              type="url"
              name="instagramLink"
              value={formData.instagramLink}
              onChange={handleInstagramChange}
              placeholder="https://instagram.com/property_video"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          {instagramLinkErr && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {instagramLinkErr}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add an Instagram video link to showcase your property
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            YouTube Link (Optional)
          </label>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <BsYoutube className="text-2xl text-red-500 flex-shrink-0" />
            <input
              type="url"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleYouTubeChange}
              placeholder="https://youtube.com/property_video"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          {youTubeLinkErr && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {youTubeLinkErr}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add a YouTube video link to showcase your property
          </p>
        </div>
      </div>

      {/* Media Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Media Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Images:</span>
            <span
              className={`font-medium ${
                images.length > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {images.length} uploaded {images.length === 0 ? '(Required)' : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Instagram:</span>
            <span
              className={`font-medium ${
                formData.instagramLink
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {formData.instagramLink ? 'Added' : 'Not added'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">YouTube:</span>
            <span
              className={`font-medium ${
                formData.youtubeLink
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {formData.youtubeLink ? 'Added' : 'Not added'}
            </span>
          </div>
        </div>
      </div>

      {/* Upload Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Upload Tips
        </h5>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use high-quality images with good lighting</li>
          <li>• Include exterior, interior, and key feature photos</li>
          <li>• The first image will be your main thumbnail</li>
          <li>• Maximum file size: 2MB per image</li>
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaStep;
