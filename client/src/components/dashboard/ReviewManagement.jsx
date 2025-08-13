import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaSearch,
  FaStar,
  FaUser,
  FaHome,
} from 'react-icons/fa';
import { MdRateReview } from 'react-icons/md';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';
import Dashboard from './Dashboard';

// Modal Component for Rejection Reason
const RejectModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Reject Review
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for rejection:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Enter reason for rejecting this review..."
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejecting...' : 'Reject Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, size = 'text-sm' }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${size} ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
        ({rating}/5)
      </span>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => (
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

const ReviewManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    reviewId: null,
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(
        `/listing/admin/reviews?${queryParams}`
      );
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest.get('/listing/admin/reviews/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleApprove = async (reviewId) => {
    setActionLoading((prev) => ({ ...prev, [reviewId]: 'approving' }));

    try {
      await apiRequest.put(`/listing/admin/reviews/${reviewId}/approve`);
      toast.success('Review approved successfully');
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    } finally {
      setActionLoading((prev) => ({ ...prev, [reviewId]: null }));
    }
  };

  const handleReject = async (reason) => {
    const reviewId = rejectModal.reviewId;
    setActionLoading((prev) => ({ ...prev, [reviewId]: 'rejecting' }));

    try {
      await apiRequest.delete(`/listing/admin/reviews/${reviewId}`, {
        data: { reason },
      });
      toast.success('Review rejected successfully');
      setRejectModal({ isOpen: false, reviewId: null });
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    } finally {
      setActionLoading((prev) => ({ ...prev, [reviewId]: null }));
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [reviewId]: 'deleting' }));

    try {
      await apiRequest.delete(`/listing/admin/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setActionLoading((prev) => ({ ...prev, [reviewId]: null }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
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

  return (
    <Dashboard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Review Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage property reviews and ratings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Reviews"
            value={stats.totalReviews || 0}
            icon={MdRateReview}
            color="bg-blue-500"
          />
          <StatsCard
            title="Approved Reviews"
            value={stats.approvedReviews || 0}
            icon={FaCheck}
            color="bg-green-500"
          />
          <StatsCard
            title="Pending Reviews"
            value={stats.pendingReviews || 0}
            icon={FaTimes}
            color="bg-yellow-500"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            icon={FaStar}
            color="bg-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Reviews</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
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

        {/* Reviews List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-8">
              <MdRateReview className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No reviews found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Author Info */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            review.author.profilePhoto || '/default-avatar.png'
                          }
                          alt={review.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.author.firstName || review.author.username}
                          </p>
                          {review.author.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Verified
                            </span>
                          )}
                          <StarRating rating={review.rating} />
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {review.comment}
                        </p>

                        {/* Property Info */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <FaHome className="w-4 h-4" />
                          <Link
                            to={`/property/${review.listing.slug}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {review.listing.name}
                          </Link>
                          <span>•</span>
                          <span>
                            by{' '}
                            {review.listing.user.firstName ||
                              review.listing.user.username}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                review.isApproved
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
                              {review.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading[review.id] === 'approving'}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[review.id] === 'approving' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <FaCheck className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </button>
                      )}

                      {!review.isApproved && (
                        <button
                          onClick={() =>
                            setRejectModal({
                              isOpen: true,
                              reviewId: review.id,
                            })
                          }
                          disabled={actionLoading[review.id] === 'rejecting'}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[review.id] === 'rejecting' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <FaTimes className="w-3 h-3 mr-1" />
                          )}
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={actionLoading[review.id] === 'deleting'}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[review.id] === 'deleting' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <FaTrash className="w-3 h-3 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
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
                  {Math.min(
                    pagination.current * filters.limit,
                    pagination.total
                  )}{' '}
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

        {/* Reject Modal */}
        <RejectModal
          isOpen={rejectModal.isOpen}
          onClose={() => setRejectModal({ isOpen: false, reviewId: null })}
          onConfirm={handleReject}
          loading={actionLoading[rejectModal.reviewId] === 'rejecting'}
        />
      </div>
    </Dashboard>
  );
};

export default ReviewManagement;
