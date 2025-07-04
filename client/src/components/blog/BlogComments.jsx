import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { MdPending, MdApproval } from 'react-icons/md';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';

const BlogComments = () => {
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    approved: '',
    blogId: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchComments();
    fetchBlogs();
    fetchStats();
  }, [filters]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(`/blog/comments?${queryParams}`);
      setComments(response.data.comments || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await apiRequest.get('/blog/admin?limit=100');
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // This would need to be implemented in the backend
      const response = await apiRequest.get('/blog/comments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback: calculate from current comments
      const totalComments = comments.length;
      const approvedComments = comments.filter((c) => c.isApproved).length;
      const pendingComments = totalComments - approvedComments;

      setStats({
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
      });
    }
  };

  const handleApprove = async (commentId) => {
    try {
      await apiRequest.put(`/blog/comments/${commentId}/approve`);
      toast.success('Comment approved successfully');
      fetchComments();
      fetchStats();
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error('Failed to approve comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await apiRequest.delete(`/blog/comments/${commentId}`);
      toast.success('Comment deleted successfully');
      fetchComments();
      fetchStats();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Comment Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Moderate and manage blog comments
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Comments"
          value={stats.total}
          icon={MdPending}
          color="bg-blue-500"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={FaCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={MdApproval}
          color="bg-yellow-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filters.approved}
            onChange={(e) => handleFilterChange('approved', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filters.blogId}
            onChange={(e) => handleFilterChange('blogId', e.target.value)}
          >
            <option value="">All Blog Posts</option>
            {blogs.map((blog) => (
              <option key={blog.id} value={blog.id}>
                {blog.title}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">
              No comments found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        comment.author?.profilePhoto || '/default-avatar.png'
                      }
                      alt={comment.author?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {comment.author?.firstName || comment.author?.username}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.author?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        comment.isApproved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {comment.isApproved ? 'Approved' : 'Pending'}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <Link
                    to={`/blog/${comment.blog?.slug}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                  >
                    On: {comment.blog?.title}
                  </Link>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <FaCheck className="mr-1" />
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <FaTimes className="mr-1" />
                      Delete
                    </button>
                  </div>

                  <Link
                    to={`/blog/${comment.blog?.slug}#comment-${comment.id}`}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <FaEye className="mr-1" />
                    View on Blog
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.current - 1) * filters.limit + 1} to{' '}
                {Math.min(pagination.current * filters.limit, pagination.total)}{' '}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleFilterChange('page', pagination.current - 1)
                  }
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    handleFilterChange('page', pagination.current + 1)
                  }
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogComments;
