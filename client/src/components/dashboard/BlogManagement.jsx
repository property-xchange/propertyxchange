import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { MdPublish, MdUnpublished } from 'react-icons/md';
import { Upload, Image, Trash2 } from 'lucide-react';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';
import Dashboard from './Dashboard';
import UploadWidget from '../common/page-components/UploadWidget.jsx';
import {
  extractPublicIdFromUrl,
  deleteFromCloudinary,
  isCloudinaryUrl,
  getOptimizedUrl,
} from '../../helper/cloudinaryHelper';

// Modal Component
const BlogModal = ({ isOpen, onClose, blogId, onSuccess }) => {
  const { currentUser } = useContext(AuthContext);
  const isEditMode = Boolean(blogId);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    categoryId: '',
    tags: '',
    isFeatured: false,
    isPublished: false,
    featuredImage: '',
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(false);
  const [deletingImages, setDeletingImages] = useState(new Set());

  // Cloudinary configuration for blog images
  const uwConfig = {
    cloudName: 'propertyxchange', // Replace with your cloudinary name
    uploadPreset: 'blog_images', // Replace with your upload preset
    multiple: true,
    maxImageFileSize: 2000000,
    maxFiles: 10,
    folder: 'blog',
    sources: ['local', 'url'],
    showAdvancedOptions: false,
    cropping: true,
    croppingAspectRatio: 1.78, // 16:9 aspect ratio for blog images
    croppingValidateDimensions: true,
    resourceType: 'image',
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxImageWidth: 1920,
    maxImageHeight: 1080,
    theme: 'minimal',
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

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (isEditMode) {
        fetchBlog();
      } else {
        resetForm();
      }
    }
  }, [isOpen, blogId]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      seoTitle: '',
      seoDescription: '',
      metaKeywords: '',
      categoryId: '',
      tags: '',
      isFeatured: false,
      isPublished: false,
      featuredImage: '',
      images: [],
    });
    setDeletingImages(new Set());
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest.get('/blog/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchBlog = async () => {
    try {
      setFetchingBlog(true);
      const response = await apiRequest.get(`/blog/admin?id=${blogId}`);
      const blog = response.data.blogs.find((b) => b.id === blogId);

      if (!blog) {
        toast.error('Blog not found');
        onClose();
        return;
      }

      // Check if user can edit this blog
      if (currentUser?.role !== 'ADMIN' && blog.authorId !== currentUser?.id) {
        toast.error('You do not have permission to edit this blog');
        onClose();
        return;
      }

      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        seoTitle: blog.seoTitle || '',
        seoDescription: blog.seoDescription || '',
        metaKeywords: blog.metaKeywords?.join(', ') || '',
        categoryId: blog.categoryId,
        tags: blog.tags?.join(', ') || '',
        isFeatured: blog.isFeatured,
        isPublished: blog.isPublished,
        featuredImage: blog.featuredImage || '',
        images: blog.images || [],
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      onClose();
    } finally {
      setFetchingBlog(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        ...formData,
        metaKeywords: formData.metaKeywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        images: formData.images, // Already an array
      };

      if (isEditMode) {
        await apiRequest.put(`/blog/${blogId}`, blogData);
        toast.success('Blog updated successfully');
      } else {
        await apiRequest.post('/blog', blogData);
        toast.success('Blog created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSEOFromTitle = () => {
    if (formData.title && !formData.seoTitle) {
      setFormData((prev) => ({
        ...prev,
        seoTitle: prev.title,
      }));
    }
  };

  const setFeaturedImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      featuredImage: imageUrl,
    }));
  };

  const setImages = (imageUrls) => {
    setFormData((prev) => ({
      ...prev,
      images: imageUrls,
    }));
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = formData.images[indexToRemove];
    if (!imageUrl) return;

    setDeletingImages((prev) => new Set([...prev, indexToRemove]));

    try {
      if (isCloudinaryUrl(imageUrl)) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          const deleted = await deleteFromCloudinary(
            publicId,
            uwConfig.cloudName
          );
          if (!deleted) {
            toast.error('Warning: Could not delete image from cloud storage');
          } else {
            toast.success('Image deleted successfully');
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error deleting image');
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }));
    } finally {
      setDeletingImages((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(indexToRemove);
        return newSet;
      });
    }
  };

  const clearFeaturedImage = async () => {
    if (!formData.featuredImage) return;

    try {
      if (isCloudinaryUrl(formData.featuredImage)) {
        const publicId = extractPublicIdFromUrl(formData.featuredImage);
        if (publicId) {
          await deleteFromCloudinary(publicId, uwConfig.cloudName);
        }
      }
      setFormData((prev) => ({ ...prev, featuredImage: '' }));
      toast.success('Featured image removed');
    } catch (error) {
      console.error('Error removing featured image:', error);
      setFormData((prev) => ({ ...prev, featuredImage: '' }));
      toast.error('Featured image removed (may still exist in cloud)');
    }
  };

  const generateExcerptFromContent = () => {
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content
        .replace(/<[^>]*>/g, '')
        .substring(0, 200);
      setFormData((prev) => ({
        ...prev,
        excerpt,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {fetchingBlog ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Content
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.title}
                            onChange={handleChange}
                            onBlur={generateSEOFromTitle}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Content *
                          </label>
                          <textarea
                            name="content"
                            required
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.content}
                            onChange={handleChange}
                            onBlur={generateExcerptFromContent}
                            placeholder="Write your blog content here..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Excerpt
                          </label>
                          <textarea
                            name="excerpt"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.excerpt}
                            onChange={handleChange}
                            placeholder="Brief description of your blog post..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO Section */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        SEO Settings
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SEO Title
                          </label>
                          <input
                            type="text"
                            name="seoTitle"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.seoTitle}
                            onChange={handleChange}
                            placeholder="SEO optimized title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SEO Description
                          </label>
                          <textarea
                            name="seoDescription"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.seoDescription}
                            onChange={handleChange}
                            placeholder="SEO description..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.seoDescription.length}/160 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Meta Keywords
                          </label>
                          <input
                            type="text"
                            name="metaKeywords"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.metaKeywords}
                            onChange={handleChange}
                            placeholder="keyword1, keyword2, keyword3"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Separate keywords with commas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Publish Settings
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category *
                          </label>
                          <select
                            name="categoryId"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.categoryId}
                            onChange={handleChange}
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags
                          </label>
                          <input
                            type="text"
                            name="tags"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="tag1, tag2, tag3"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Separate tags with commas
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            id="isFeatured"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="isFeatured"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Featured Post
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="isPublished"
                            id="isPublished"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={formData.isPublished}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="isPublished"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Publish Immediately
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Media
                      </h3>

                      <div className="space-y-6">
                        {/* Featured Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Featured Image
                          </label>

                          {formData.featuredImage ? (
                            <div className="relative group">
                              <img
                                src={getOptimizedUrl(formData.featuredImage, {
                                  width: 400,
                                  height: 225,
                                })}
                                alt="Featured"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={clearFeaturedImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                              <div className="flex flex-col items-center space-y-3">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Upload featured image
                                  </p>
                                  <UploadWidget
                                    uwConfig={{
                                      ...uwConfig,
                                      multiple: false,
                                      maxFiles: 1,
                                      folder: 'blog/featured',
                                    }}
                                    setPublicId={(publicId) => {
                                      const imageUrl = `https://res.cloudinary.com/${uwConfig.cloudName}/image/upload/v1/${publicId}`;
                                      setFeaturedImage(imageUrl);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Images Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Additional Images
                            </label>
                            {formData.images.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.images.length}/10 images
                              </span>
                            )}
                          </div>

                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <Image className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Upload additional images
                                </p>
                                <UploadWidget
                                  uwConfig={{
                                    ...uwConfig,
                                    folder: 'blog/gallery',
                                  }}
                                  setState={setImages}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Image Preview Grid */}
                          {formData.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                              {formData.images.map((image, index) => (
                                <div
                                  key={`${image}-${index}`}
                                  className="relative group"
                                >
                                  <img
                                    src={getOptimizedUrl(image, {
                                      width: 200,
                                      height: 150,
                                    })}
                                    alt={`Blog image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-opacity group-hover:opacity-75"
                                    loading="lazy"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    disabled={deletingImages.has(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                                  >
                                    {deletingImages.has(index) ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <RiDeleteBin5Fill size={12} />
                                    )}
                                  </button>
                                  <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {index + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Manual URL Input (Alternative) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Or enter image URL manually
                          </label>
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                e.preventDefault();
                                const url = e.target.value.trim();
                                if (
                                  !formData.featuredImage &&
                                  formData.images.length === 0
                                ) {
                                  setFeaturedImage(url);
                                } else {
                                  setImages([...formData.images, url]);
                                }
                                e.target.value = '';
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Press Enter to add image URL
                          </p>
                        </div>

                        {/* Media Summary */}
                        <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                            Media Summary
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Featured Image:
                              </span>
                              <span
                                className={`font-medium ${
                                  formData.featuredImage
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {formData.featuredImage ? 'Set' : 'Not set'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Additional Images:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formData.images.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Saving...'
                      : isEditMode
                      ? 'Update Blog'
                      : 'Create Blog'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    published: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(`/blog/admin?${queryParams}`);
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest.get('/blog/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await apiRequest.delete(`/blog/${blogId}`);
      toast.success('Blog post deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (blogId, currentStatus) => {
    try {
      await apiRequest.put(`/blog/${blogId}`, {
        isPublished: !currentStatus,
      });
      toast.success(
        `Blog post ${!currentStatus ? 'published' : 'unpublished'} successfully`
      );
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canEdit = (blog) => {
    return currentUser?.role === 'ADMIN' || blog.authorId === currentUser?.id;
  };

  const handleCreateBlog = () => {
    setEditingBlogId(null);
    setIsModalOpen(true);
  };

  const handleEditBlog = (blogId) => {
    setEditingBlogId(blogId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBlogId(null);
  };

  const handleModalSuccess = () => {
    fetchBlogs(); // Refresh the blog list
  };

  return (
    <Dashboard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blog Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your blog posts and content
            </p>
          </div>
          <button
            onClick={handleCreateBlog}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create New Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.published}
              onChange={(e) => handleFilterChange('published', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Blog List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500 dark:text-gray-400">
                No blog posts found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {blog.featuredImage && (
                            <img
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              src={blog.featuredImage}
                              alt={blog.title}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {blog.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {blog.readingTime} min read
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full mr-2"
                            src={
                              blog.author.profilePhoto || '/default-avatar.png'
                            }
                            alt={blog.author.username}
                          />
                          <div className="text-sm text-gray-900 dark:text-white">
                            {blog.author.firstName || blog.author.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: blog.category.color + '20',
                            color: blog.category.color,
                          }}
                        >
                          {blog.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.isPublished
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {blog.viewCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          {canEdit(blog) && (
                            <>
                              <button
                                onClick={() => handleEditBlog(blog.id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleTogglePublish(blog.id, blog.isPublished)
                                }
                                className={`${
                                  blog.isPublished
                                    ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400'
                                    : 'text-green-600 hover:text-green-900 dark:text-green-400'
                                }`}
                                title={
                                  blog.isPublished ? 'Unpublish' : 'Publish'
                                }
                              >
                                {blog.isPublished ? (
                                  <MdUnpublished />
                                ) : (
                                  <MdPublish />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(blog.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(pagination.current - 1) * filters.limit + 1} to{' '}
                  {Math.min(
                    pagination.current * filters.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleFilterChange('page', pagination.current - 1)
                    }
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      handleFilterChange('page', pagination.current + 1)
                    }
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blog Modal */}
        <BlogModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          blogId={editingBlogId}
          onSuccess={handleModalSuccess}
        />
      </div>
    </Dashboard>
  );
};

export default BlogManagement;
