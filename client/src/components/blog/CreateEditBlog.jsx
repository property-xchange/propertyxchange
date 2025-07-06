// CreateBlog.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';
import { Dashboard } from '../dashboard';

const CreateEditBlog = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const isEditMode = Boolean(id);

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
    images: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(isEditMode);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBlog();
    }
  }, [id]);

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
      const response = await apiRequest.get(`/blog/admin?id=${id}`);
      const blog = response.data.blogs.find((b) => b.id === id);

      if (!blog) {
        toast.error('Blog not found');
        navigate('/blog-management');
        return;
      }

      // Check if user can edit this blog
      if (currentUser?.role !== 'ADMIN' && blog.authorId !== currentUser?.id) {
        toast.error('You do not have permission to edit this blog');
        navigate('/blog-management');
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
        images: blog.images?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      navigate('/blog-management');
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
        images: formData.images
          .split(',')
          .map((img) => img.trim())
          .filter((img) => img.length > 0),
      };

      if (isEditMode) {
        await apiRequest.put(`/blog/${id}`, blogData);
        toast.success('Blog updated successfully');
      } else {
        await apiRequest.post('/blog', blogData);
        toast.success('Blog created successfully');
      }

      navigate('/blog-management');
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

  if (fetchingBlog) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Dashboard>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditMode
              ? 'Update your blog post'
              : 'Create engaging content for your audience'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Content
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Brief description of your blog post..."
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  SEO Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seoTitle"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      placeholder="SEO optimized title"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Publish Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Media
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      name="featuredImage"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.featuredImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Images
                    </label>
                    <textarea
                      name="images"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.images}
                      onChange={handleChange}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Separate image URLs with commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Saving...'
                      : isEditMode
                      ? 'Update Blog'
                      : 'Create Blog'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/blog-management')}
                    className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Dashboard>
  );
};

export default CreateEditBlog;
