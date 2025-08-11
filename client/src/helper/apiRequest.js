//src/helper/apiRequest.js
import axios from 'axios';

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_SERVER_DOMAINAPI,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiRequest.interceptors.request.use(
  (config) => {
    // Get token from localStorage as fallback if cookies don't work
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Request failed';

    error.message = serverMsg; // <- most code/Toast reads this
    error.serverMessage = serverMsg; // <- optional explicit field
    error.status = error?.response?.status; // <- handy to branch on status

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default apiRequest;
