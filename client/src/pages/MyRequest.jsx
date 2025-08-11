import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import apiRequest from '../helper/apiRequest.js';
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiDollarSign,
  FiMessageSquare,
  FiCalendar,
  FiClock,
  FiUsers,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Dashboard from '../components/dashboard/Dashboard.jsx';

const MyRequests = () => {
  const { currentUser } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
    order: 'desc',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'OPEN', label: 'Open' },
    { value: 'MATCHED', label: 'Matched' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests();
    }
  }, [currentUser, filters, pagination.current]);

  const fetchMyRequests = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      const response = await apiRequest.get(
        `/request/user/my-requests?${queryParams}`
      );

      if (response.data.success) {
        setRequests(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch my requests error:', error);
      toast.error('Failed to fetch your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      const response = await apiRequest.delete(`/request/${requestId}`);
      if (response.data.success) {
        toast.success('Request deleted successfully');
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        // Update pagination total
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error('Delete request error:', error);
      toast.error('Failed to delete request');
    }
  };

  const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      MATCHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || colors.OPEN;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7 && diffInDays > 0; // Expires within 7 days
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view your property requests
          </p>
          <Link
            to="/sign-in"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Property Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track your property requests
              </p>
            </div>
            <Link
              to="/dashboard/property-request"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <FiPlus className="w-4 h-4" />
              New Request
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Requests
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={`${filters.sortBy}-${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split('-');
                  setFilters((prev) => ({ ...prev, sortBy, order }));
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="budget-desc">Highest Budget</option>
                <option value="budget-asc">Lowest Budget</option>
              </select>

              <button
                onClick={() => fetchMyRequests(1)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          {!loading && requests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Requests',
                  count: pagination.total,
                  color: 'blue',
                  icon: FiMessageSquare,
                },
                {
                  label: 'Open Requests',
                  count: requests.filter((req) => req.status === 'OPEN').length,
                  color: 'green',
                  icon: FiEye,
                },
                {
                  label: 'With Responses',
                  count: requests.filter((req) => req._count?.responses > 0)
                    .length,
                  color: 'purple',
                  icon: FiUsers,
                },
                {
                  label: 'Closed/Matched',
                  count: requests.filter((req) =>
                    ['CLOSED', 'MATCHED'].includes(req.status)
                  ).length,
                  color: 'gray',
                  icon: FiCalendar,
                },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.count}
                        </p>
                      </div>
                      <IconComponent
                        className={`w-8 h-8 text-${stat.color}-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {loading
                ? 'Loading...'
                : `${pagination.total} request${
                    pagination.total !== 1 ? 's' : ''
                  } found`}
            </p>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Expiration Warning */}
                  {isExpiringSoon(request.expiresAt) && (
                    <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          This request expires soon (
                          {formatDate(request.expiresAt)})
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expired Warning */}
                  {isExpired(request.expiresAt) && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          This request has expired (
                          {formatDate(request.expiresAt)})
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.type
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          {request.subType &&
                            ` - ${request.subType
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}`}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.toLowerCase()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.purpose === 'RENT'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : request.purpose === 'SALE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : request.purpose === 'SHORT_LET'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}
                        >
                          {request.purpose.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FiMapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {request.lga}, {request.state}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <FiDollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-sm">
                            {formatBudget(request.budget)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FiUsers className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            {request._count?.responses || 0} response
                            {request._count?.responses !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FiClock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            {getTimeAgo(request.createdAt)}
                          </span>
                        </div>
                      </div>

                      {request.number_of_beds && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                          <span className="text-sm font-medium">Bedrooms:</span>
                          <span className="text-sm">
                            {request.number_of_beds}
                          </span>
                        </div>
                      )}

                      {request.comments && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          "{request.comments}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 lg:ml-4">
                      <Link
                        to={`/property-request?search=${encodeURIComponent(
                          request.name || request.type
                        )}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View in Public Listings"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>

                      {(request.status === 'PENDING' ||
                        request.status === 'OPEN') && (
                        <button
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Request"
                          onClick={() =>
                            toast.info('Edit functionality coming soon!')
                          }
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Request"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        <span>
                          {request.viewCount} view
                          {request.viewCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Created {formatDate(request.createdAt)}</span>
                      </div>
                      {request.expiresAt && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span
                            className={
                              isExpired(request.expiresAt)
                                ? 'text-red-600 dark:text-red-400'
                                : isExpiringSoon(request.expiresAt)
                                ? 'text-orange-600 dark:text-orange-400'
                                : ''
                            }
                          >
                            Expires {formatDate(request.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {request._count?.responses > 0 && (
                        <Link
                          to={`/property-request?search=${encodeURIComponent(
                            request.name || request.type
                          )}`}
                          className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        >
                          View {request._count.responses} Response
                          {request._count.responses !== 1 ? 's' : ''}
                        </Link>
                      )}

                      <Link
                        to={`/property-request?search=${encodeURIComponent(
                          request.name || request.type
                        )}`}
                        className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.status
                  ? `You don't have any ${filters.status.toLowerCase()} requests yet.`
                  : "You haven't created any property requests yet."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/dashboard/property-request"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Your First Request
                </Link>
                {filters.status && (
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: '' }))
                    }
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMyRequests(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                    const page = Math.max(1, pagination.current - 2) + index;
                    if (page > pagination.pages) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => fetchMyRequests(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === pagination.current
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => fetchMyRequests(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.current} of {pagination.pages} (
                {pagination.total} total)
              </p>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default MyRequests;
