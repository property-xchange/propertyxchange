import { create } from 'zustand';
import apiRequest from '../helper/apiRequest.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: false, // Separate from isLoading
  message: null,
  initialized: false, // Track if store has been initialized

  // Initialize auth state from localStorage
  initializeAuth: () => {
    const state = get();
    if (state.initialized) return; // Prevent multiple initializations

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({
          user,
          isAuthenticated: true,
          initialized: true,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ initialized: true });
      }
    } else {
      set({ initialized: true });
    }
  },

  signup: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/register', {
        email,
        password,
        username,
      });

      const user = response.data.user;
      const token = response.data.token;

      // Store token and user data
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Signup failed';
      set({ error: errorMessage, isLoading: false });
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
      const token = response.data.token;

      // Store token and user data
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        error: null,
        isLoading: false,
      });

      // Update context if provided
      if (updateUser) updateUser(user);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed';
      console.error('Login error:', errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/verify-email', { code });
      const user = response.data.user;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Email verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    const state = get();

    // Prevent multiple simultaneous auth checks
    if (state.isCheckingAuth) {
      return;
    }

    set({ isCheckingAuth: true, error: null });

    try {
      const response = await apiRequest.get('/auth/check-auth');
      const user = response.data.user;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isCheckingAuth: false,
        error: null,
      });

      console.log('✅ Auth check successful:', user.id);
      return user;
    } catch (error) {
      console.log(
        '❌ Auth check failed:',
        error.response?.data?.message || error.message
      );

      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        error: null, // Don't set error for auth check failures
      });

      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest.post('/auth/forgot-password', {
        email,
      });
      set({ message: response.data.message, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Password reset request failed';
      set({ error: errorMessage, isLoading: false });
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
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Password reset failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear message
  clearMessage: () => set({ message: null }),

  // Reset loading states
  resetLoading: () => set({ isLoading: false, isCheckingAuth: false }),
}));
