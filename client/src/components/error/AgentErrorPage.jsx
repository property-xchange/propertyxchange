import React from 'react';
import { Link, useRouteError, useNavigate } from 'react-router-dom';
import {
  FaExclamationTriangle,
  FaHome,
  FaArrowLeft,
  FaUsers,
} from 'react-icons/fa';

const AgentErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Agent Error:', error);

  const getErrorMessage = () => {
    if (error?.message?.includes('Failed to load agent')) {
      return 'Agent not found or temporarily unavailable';
    }
    if (error?.status === 404) {
      return "The agent you're looking for doesn't exist";
    }
    if (error?.status === 500) {
      return 'Server error occurred while loading agent';
    }
    return error?.message || 'Something went wrong while loading the agent';
  };

  const getErrorTitle = () => {
    if (error?.status === 404) return 'Agent Not Found';
    if (error?.status === 500) return 'Server Error';
    return 'Failed to Load Agent';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <FaExclamationTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {getErrorTitle()}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {getErrorMessage()}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/agents"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaUsers className="w-4 h-4" />
            Browse All Agents
          </Link>

          <Link
            to="/"
            className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaHome className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 text-left">
            <details className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Debug Information (Development Only)
              </summary>
              <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
                {error.stack || JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentErrorPage;
