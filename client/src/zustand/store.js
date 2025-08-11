import { create } from 'zustand';
import apiRequest from '../helper/apiRequest.js';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/register', {
        email,
        password,
        username,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password, updateUser) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/login', {
        email,
        password,
      });

      const user = response.data.user;
      set({
        isAuthenticated: true,
        user,
        error: null,
        isLoading: false,
      });
      updateUser(user);
    } catch (error) {
      console.error(
        'Login error:',
        error.response?.data?.message || error.message
      );
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest.post('/auth/logout');
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Error logging out', isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/verify-email', { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/verify-email', { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await apiRequest.get('/auth/check-auth');
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      console.log(response.data.user);
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/forgot-password', {
        email,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post(`/auth/reset-password/${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Error resetting password',
      });
      throw error;
    }
  },
}));

export const useBlogStore = create((set, get) => ({
  // State
  blogs: [],
  categories: [],
  comments: [],
  currentBlog: null,
  loading: false,
  error: null,
  pagination: {},
  filters: {
    search: '',
    category: '',
    tag: '',
    featured: false,
    published: '',
    page: 1,
    limit: 10,
    sortBy: 'publishedAt',
    order: 'desc',
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () =>
    set({
      filters: {
        search: '',
        category: '',
        tag: '',
        featured: false,
        published: '',
        page: 1,
        limit: 10,
        sortBy: 'publishedAt',
        order: 'desc',
      },
    }),

  // Fetch all blogs (public)
  fetchBlogs: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(`/blog?${queryParams}`);
      set({
        blogs: response.data.blogs,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch blogs',
        loading: false,
      });
    }
  },

  // Fetch blogs for admin/staff
  fetchBlogsAdmin: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(`/blog/admin?${queryParams}`);
      set({
        blogs: response.data.blogs,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch blogs',
        loading: false,
      });
    }
  },

  // Fetch single blog by slug
  fetchBlogBySlug: async (slug) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.get(`/blog/slug/${slug}`);
      set({
        currentBlog: response.data,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Blog not found',
        loading: false,
      });
      return null;
    }
  },

  // Create blog
  createBlog: async (blogData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.post('/blog', blogData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create blog',
        loading: false,
      });
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.put(`/blog/${id}`, blogData);

      // Update the blog in the local state
      set((state) => ({
        blogs: state.blogs.map((blog) =>
          blog.id === id ? response.data : blog
        ),
        currentBlog:
          state.currentBlog?.id === id ? response.data : state.currentBlog,
        loading: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update blog',
        loading: false,
      });
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      set({ loading: true, error: null });
      await apiRequest.delete(`/blog/${id}`);

      // Remove the blog from local state
      set((state) => ({
        blogs: state.blogs.filter((blog) => blog.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete blog',
        loading: false,
      });
      throw error;
    }
  },

  // Toggle blog publish status
  togglePublishStatus: async (id, currentStatus) => {
    try {
      const response = await apiRequest.put(`/blog/${id}`, {
        isPublished: !currentStatus,
      });

      set((state) => ({
        blogs: state.blogs.map((blog) =>
          blog.id === id ? { ...blog, isPublished: !currentStatus } : blog
        ),
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update blog status',
      });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const response = await apiRequest.get('/blog/categories');
      set({ categories: response.data });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch categories',
      });
    }
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.post('/blog/categories', categoryData);
      set((state) => ({
        categories: [...state.categories, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create category',
        loading: false,
      });
      throw error;
    }
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.put(
        `/blog/categories/${id}`,
        categoryData
      );
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? response.data : cat
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update category',
        loading: false,
      });
      throw error;
    }
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    try {
      set({ loading: true, error: null });
      await apiRequest.delete(`/blog/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete category',
        loading: false,
      });
      throw error;
    }
  },

  // Submit comment
  submitComment: async (blogId, content, parentId = null) => {
    try {
      const response = await apiRequest.post('/blog/comments', {
        blogId,
        content,
        parentId,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to submit comment',
      });
      throw error;
    }
  },

  // Approve comment (staff/admin)
  approveComment: async (commentId) => {
    try {
      const response = await apiRequest.put(
        `/blog/comments/${commentId}/approve`
      );
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to approve comment',
      });
      throw error;
    }
  },

  // Delete comment (staff/admin)
  deleteComment: async (commentId) => {
    try {
      await apiRequest.delete(`/blog/comments/${commentId}`);
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete comment',
      });
      throw error;
    }
  },

  // Get featured blogs
  getFeaturedBlogs: async (limit = 3) => {
    try {
      const response = await apiRequest.get(
        `/blog?featured=true&limit=${limit}`
      );
      return response.data.blogs;
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      return [];
    }
  },

  // Get popular blogs (by view count)
  getPopularBlogs: async (limit = 5) => {
    try {
      const response = await apiRequest.get(
        `/blog?sortBy=viewCount&order=desc&limit=${limit}`
      );
      return response.data.blogs;
    } catch (error) {
      console.error('Error fetching popular blogs:', error);
      return [];
    }
  },

  // Search blogs
  searchBlogs: async (query) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.get(
        `/blog?search=${encodeURIComponent(query)}`
      );
      set({
        blogs: response.data.blogs,
        pagination: response.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Search failed',
        loading: false,
      });
      throw error;
    }
  },

  // Get blogs by category
  getBlogsByCategory: async (categorySlug) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.get(`/blog?category=${categorySlug}`);
      set({
        blogs: response.data.blogs,
        pagination: response.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch blogs',
        loading: false,
      });
      throw error;
    }
  },

  // Get blogs by tag
  getBlogsByTag: async (tag) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRequest.get(
        `/blog?tag=${encodeURIComponent(tag)}`
      );
      set({
        blogs: response.data.blogs,
        pagination: response.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch blogs',
        loading: false,
      });
      throw error;
    }
  },

  // Clear current blog
  clearCurrentBlog: () => set({ currentBlog: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
