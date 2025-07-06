import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useAuthStore } from '../zustand/store';
import axios from 'axios';

export default function SignIn() {
  const { updateUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendSection, setShowResendSection] = useState(false);

  const { login, isLoading, isAuthenticated, error } = useAuthStore();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password, updateUser);
      setShowResendSection(false);
      toast.success('Login successful');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
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
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      await axios.post('/api/auth/resend-verification-email', { email });
      toast.success('Verification code sent! Please check your inbox.');
      navigate('/verify-email');
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err.message || 'Failed to resend email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto mt-11">
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
    </div>
  );
}
