import { useState, useEffect } from 'react';
import { useAuthStore } from '../zustand/store.js';
import { ArrowLeft, Loader, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword, error, message } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
    toast.success('Password reset link sent to your email');
  };

  return (
    <>
      <div className="p-3 max-w-lg mx-auto mt-11">
        <h1 className="text-3xl text-center font-semibold my-7">
          Forgot Password
        </h1>
        {!isSubmitted ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <p className="text-gray-300 mb-6 text-center">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <input
              type="email"
              placeholder="Email"
              className="border p-3 rounded-lg input"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
            >
              {isLoading ? (
                <Loader className="size-6 animate-spin mx-auto" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className=" flex items-start justify-center mx-auto mb-4 gap-3">
            <Mail className="h-8 w-8 text-white" />
            <p className="mb-6">
              If an account exists for{' '}
              <span className="text-blue-500">{email}</span>, you will receive a
              password reset link shortly.
            </p>
          </div>
        )}
      </div>
      <div className="px-8 py-4  flex justify-center">
        <Link
          to={'/sign-in'}
          className="text-sm text-primary hover:underline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Link>
      </div>
    </>
  );
};

export default ForgotPassword;
