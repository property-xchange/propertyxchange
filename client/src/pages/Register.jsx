import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter.jsx';
import { useAuthStore } from '../zustand/store.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { signup, error: storeError, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await signup(email, password, username);
      navigate('/verify-email');
    } catch (err) {
      toast.error(
        err.message || storeError || 'An error occurred during signup.'
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-3 max-w-lg mx-auto mt-11">
      <h1 className="text-3xl text-center font-semibold my-7">Register</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg input"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg input"
          id="email"
          name="email"
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
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>
        <PasswordStrengthMeter password={password} />
        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className=" animate-spin mx-auto" size={24} />
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
      <div className="flex mt-5">
        <div className="flex gap-2">
          <p>Already registered?</p>
          <Link to="/sign-in">
            <span className="text-blue-700 hover:text-primary transition-all duration-300">
              Login now
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
