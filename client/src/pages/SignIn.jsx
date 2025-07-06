// Enhanced SignIn component with debugging
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../zustand/store';
import apiRequest from '../helper/apiRequest.js';

export default function SignIn() {
  const { updateUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendSection, setShowResendSection] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  const { login, isLoading, isAuthenticated, error } = useAuthStore();
  const navigate = useNavigate();

  // Debug function to test API connectivity
  const testAPIConnection = async () => {
    console.log('🔍 Testing API Connection...');

    try {
      // Test basic API endpoint
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API}/health`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      console.log('✅ API Health Check:', response.status);

      setDebugInfo((prev) => ({
        ...prev,
        apiHealth: response.status === 200 ? 'Connected' : 'Failed',
        apiUrl: import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API,
      }));
    } catch (error) {
      console.log('❌ API Connection Failed:', error);
      setDebugInfo((prev) => ({
        ...prev,
        apiHealth: 'Failed',
        apiError: error.message,
      }));
    }
  };

  // Test authentication endpoint
  const testAuthEndpoint = async () => {
    console.log('🔍 Testing Auth Endpoint...');

    try {
      const response = await apiRequest.get('/debug/auth');
      console.log('✅ Auth test successful:', response.data);

      setDebugInfo((prev) => ({
        ...prev,
        authTest: 'Success',
        authData: response.data,
      }));
    } catch (error) {
      console.log(
        '❌ Auth test failed:',
        error.response?.data || error.message
      );

      setDebugInfo((prev) => ({
        ...prev,
        authTest: 'Failed',
        authError: error.response?.data?.message || error.message,
      }));
    }
  };

  useEffect(() => {
    // Run debug tests on component mount
    testAPIConnection();

    // Set debug info
    setDebugInfo((prev) => ({
      ...prev,
      environment: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API,
      isProduction: import.meta.env.PROD,
      userAgent: navigator.userAgent,
      currentOrigin: window.location.origin,
    }));

    console.log('🔍 Environment Debug Info:', {
      mode: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API,
      isProd: import.meta.env.PROD,
      origin: window.location.origin,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    console.log('🚀 Starting login process...');
    console.log('📧 Email:', email);
    console.log('🌐 Environment:', import.meta.env.MODE);
    console.log(
      '🔗 API URL:',
      import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API
    );

    try {
      // Enhanced login with debugging
      console.log('📤 Sending login request...');

      const loginData = { username: email, password };
      console.log('📦 Login payload:', {
        username: email,
        password: '***hidden***',
      });

      // Method 1: Try with apiRequest (your configured axios instance)
      let response;
      try {
        console.log('🔄 Trying login with apiRequest...');
        response = await apiRequest.post('/auth/login', loginData);
        console.log('✅ Login successful with apiRequest:', response.data);
      } catch (apiRequestError) {
        console.log('❌ apiRequest failed, trying direct fetch...');
        console.log(
          'Error details:',
          apiRequestError.response?.data || apiRequestError.message
        );

        // Method 2: Fallback to direct fetch
        const fetchResponse = await fetch(
          `${import.meta.env.VITE_REACT_APP_SERVER_DOMAIN_API}/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(loginData),
          }
        );

        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await fetchResponse.json();
        response = { data };
        console.log('✅ Login successful with fetch:', data);
      }

      const { user, token, message } = response.data;

      // Store authentication data
      if (token) {
        localStorage.setItem('token', token);
        console.log('💾 Token stored in localStorage');
      }

      if (user) {
        updateUser({ user, token });
        console.log('👤 User data updated:', user);
      }

      // Test authentication immediately after login
      setTimeout(async () => {
        await testAuthEndpoint();
      }, 1000);

      setShowResendSection(false);
      toast.success(message || 'Login successful');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('❌ Login Error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      const errorMessage =
        err?.response?.data?.message || err.message || 'An error occurred';

      if (errorMessage.includes('email not verified')) {
        toast.error(
          'Your email is not verified. Please resend the verification email.'
        );
        setShowResendSection(true);
      } else {
        setShowResendSection(false);
        toast.error(errorMessage);
      }

      // Update debug info with error
      setDebugInfo((prev) => ({
        ...prev,
        lastError: {
          message: errorMessage,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    console.log('📧 Resending verification email...');

    try {
      const response = await apiRequest.post(
        '/auth/resend-verification-email',
        { email }
      );
      console.log('✅ Verification email sent:', response.data);

      toast.success('Verification code sent! Please check your inbox.');
      navigate('/verify-email');
    } catch (err) {
      console.error('❌ Resend verification failed:', err);

      const errorMessage =
        err?.response?.data?.message || err.message || 'Failed to resend email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Debug panel (only show in development)
  const DebugPanel = () => {
    if (import.meta.env.PROD) return null;

    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
        <h3 className="font-bold mb-2">🔍 Debug Information</h3>
        <div className="space-y-2">
          <div>
            <strong>Environment:</strong> {debugInfo.environment}
          </div>
          <div>
            <strong>API URL:</strong> {debugInfo.apiUrl}
          </div>
          <div>
            <strong>API Health:</strong> {debugInfo.apiHealth || 'Not tested'}
          </div>
          <div>
            <strong>Auth Test:</strong> {debugInfo.authTest || 'Not tested'}
          </div>
          <div>
            <strong>Current Origin:</strong> {debugInfo.currentOrigin}
          </div>

          {debugInfo.lastError && (
            <div className="text-red-600">
              <strong>Last Error:</strong> {debugInfo.lastError.message}
              (Status: {debugInfo.lastError.status})
            </div>
          )}

          <div className="mt-2">
            <button
              onClick={testAPIConnection}
              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Test API
            </button>
            <button
              onClick={testAuthEndpoint}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs"
            >
              Test Auth
            </button>
          </div>

          {/* Show cookies and localStorage */}
          <div className="mt-2">
            <div>
              <strong>Cookies:</strong> {document.cookie || 'None'}
            </div>
            <div>
              <strong>Token in localStorage:</strong>{' '}
              {localStorage.getItem('token') ? 'Present' : 'None'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 max-w-lg mx-auto mt-11">
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email your address"
          minLength={4}
          className="border p-3 rounded-lg input"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="password"
            className="border p-3 rounded-lg input w-full"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </span>
        </div>

        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            'Login'
          )}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>

      <div className="flex justify-between items-center mt-5">
        <div className="flex justify-between items-center gap-2">
          <p>Don't have an account?</p>
          <Link to="/register">
            <span className="hover:text-blue-700 text-primary transition-all duration-300">
              Sign up
            </span>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <Link
            to="/forgot-password"
            className="hover:text-blue-700 text-primary transition-all duration-300"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Conditionally render the resend verification email section */}
      {showResendSection && (
        <div className="mt-4 flex gap-2 items-center">
          <p className="text-center">The email address is not validated.</p>
          <button
            onClick={resendVerificationEmail}
            disabled={isResending}
            className="hover:text-blue-700 text-primary transition-all duration-300"
          >
            {isResending ? 'Resending...' : 'Click to validate your email'}
          </button>
        </div>
      )}

      {/* Debug Panel - only shows in development */}
      <DebugPanel />
    </div>
  );
}
