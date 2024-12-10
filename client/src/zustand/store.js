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
      set({
        error: error.response?.data?.message || 'Error signing up',
        isLoading: false,
      });
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
      set({
        error: error.response?.data?.message || 'Error logging in',
        isLoading: false,
      });
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
      set({
        error: error.response?.data?.message || 'Error verifying email',
        isLoading: false,
      });
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
      set({
        error: error.response?.data?.message || 'Error verifying email',
        isLoading: false,
      });
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
      set({
        isLoading: false,
        error:
          error.response?.data?.message || 'Error sending reset password email',
      });
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
