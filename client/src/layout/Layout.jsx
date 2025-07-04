import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PublicLayout() {
  return <Outlet />;
}

function AuthLayout() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  if (currentUser.status === 'BANNED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Banned
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been banned. Please contact support for more
            information.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

function StaffLayout() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  if (currentUser.status === 'BANNED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Banned
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been banned. Please contact support for more
            information.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!['STAFF', 'ADMIN'].includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AdminLayout() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  if (currentUser.status === 'BANNED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Banned
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been banned. Please contact support for more
            information.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export { PublicLayout, AuthLayout, StaffLayout, AdminLayout };
