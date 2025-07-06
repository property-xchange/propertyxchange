import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../assets/avatar.webp';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { passwordValidate } from '../helper/validate';
import useFetch from '../hooks/fetch.hook';
import { useAuthStore } from '../zustand/store';
import { verifyPassword } from '../helper/helper';

export default function Password() {
  const navigate = useNavigate();
  const { username } = useAuthStore((state) => state.auth);
  const [{ isLoading, apiData, error, status }] = useFetch(`user/${username}`);

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validate: passwordValidate,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      let loginPromise = verifyPassword({
        username,
        password: values.password,
      });
      toast.promise(loginPromise, {
        loading: 'Checking...',
        success: <b>Login Successfully!</b>,
        error: <b>Password Not Match!</b>,
      });

      loginPromise.then((res) => {
        let { token } = res.data;
        localStorage.setItem('token', token);
        navigate('/dashboard');
      });
    },
  });

  if (isLoading) return <h1 className="text-2xl font-bold mt-12">isLoading</h1>;
  if (error)
    return <h1 className="text-xl text-red-500 mt-12">{error.message}</h1>;
  return (
    <div className="p-3 max-w-lg mx-auto mt-11">
      <h1 className="text-5xl font-bold text-center">
        Hello {apiData?.firstName || apiData?.username}
      </h1>
      <h1 className="text-3xl text-center font-semibold my-7">
        Please enter your password
      </h1>
      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        <div className="flex justify-center items-center">
          <img
            src={apiData?.profile || Avatar}
            alt="avatar"
            className="border-4 border-gray-100 w-[135px] rounded-full shadow-lg cursor-pointer hover:border-gray-200"
          />
        </div>
        <input
          type="text"
          placeholder="Password"
          className="border p-3 rounded-lg input"
          id="password"
          {...formik.getFieldProps('password')}
        />

        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
          type="submit"
        >
          Sign In
        </button>
      </form>
      <div className="flex mt-5">
        <div className="flex gap-2">
          <p>Forgot Password?</p>
          <Link to="/recovery">
            <span className="text-blue-700 hover:text-primary transition-all duration-300">
              Recover Now
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
