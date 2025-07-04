import React, { useState, useEffect } from 'react';
import SingleFeedCardGrid from '../../components/common/page-components/SingleFeedCardGrid';
import apiRequest from '../../helper/apiRequest';
import { Link } from 'react-router-dom';

const Feeds = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch featured blogs from API
      const response = await apiRequest.get(
        '/blog?featured=true&limit=4&sortBy=publishedAt&order=desc'
      );
      setFeaturedBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      setError('Failed to load featured blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-10 pb-16">
        <div className="text-center">
          <h1 className="mx-auto sub-heading">Blog Post</h1>
          <h1 className="heading">latest news feeds</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2">
          {/* Loading skeleton */}
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 sm:flex-row animate-pulse"
            >
              <div className="flex-shrink-0">
                <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-lg sm:w-48"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-10 pb-16">
        <div className="text-center">
          <h1 className="mx-auto sub-heading">Blog Post</h1>
          <h1 className="heading">latest news feeds</h1>
        </div>
        <div className="text-center mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchFeaturedBlogs}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-16">
      <div className="text-center">
        <h1 className="mx-auto sub-heading">Blog Post</h1>
        <h1 className="heading">latest news feeds</h1>
      </div>

      {featuredBlogs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
            {featuredBlogs.map((blog) => (
              <SingleFeedCardGrid key={blog.id} {...blog} />
            ))}
          </div>

          {/* View All Blogs Button */}
          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              View All Blog Posts
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No Featured Blogs Yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Featured blog posts will appear here once they're published.
            </p>
            <Link
              to="/blog"
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Blogs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feeds;
