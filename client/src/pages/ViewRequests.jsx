import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiRequest from '../helper/apiRequest';
import {
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiEye,
  FiMessageCircle,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi';
import RequestDetailsModal from '../components/request/RequestDetailsModal';

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    purpose: '',
    type: '',
    state: '',
    minBudget: '',
    maxBudget: '',
    search: '',
    status: 'OPEN',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  const purposeOptions = [
    { value: '', label: 'All Categories' },
    { value: 'RENT', label: 'Rent' },
    { value: 'SALE', label: 'Sale' },
    { value: 'SHORT_LET', label: 'Short Let' },
    { value: 'JOINT_VENTURE', label: 'Joint Venture' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'CO_WORKING_SPACE', label: 'Co-working Space' },
    { value: 'COMMERCIAL_PROPERTY', label: 'Commercial Property' },
    { value: 'FLAT_APARTMENT', label: 'Flat/Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'LAND', label: 'Land' },
  ];

  const statusOptions = [
    { value: 'OPEN', label: 'Open Requests' },
    { value: 'all', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'MATCHED', label: 'Matched' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const nigerianStates = [
    '',
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'FCT',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
  ];

  useEffect(() => {
    fetchRequests();
  }, [filters, pagination.current]);

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      const response = await apiRequest.get(`/request?${queryParams}`);

      if (response.data.success) {
        setRequests(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Failed to fetch property requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleViewDetails = async (request) => {
    try {
      const response = await apiRequest.get(`/request/${request.id}`);
      if (response.data.success) {
        setSelectedRequest(response.data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Fetch request details error:', error);
      toast.error('Failed to fetch request details');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Property Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse property requests from potential buyers and tenants
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Requests
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Purpose */}
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {purposeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* State */}
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All States</option>
              {nigerianStates.slice(1).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* Budget Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Budget"
                value={filters.minBudget}
                onChange={(e) =>
                  handleFilterChange('minBudget', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="number"
                placeholder="Max Budget"
                value={filters.maxBudget}
                onChange={(e) =>
                  handleFilterChange('maxBudget', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {loading
              ? 'Loading...'
              : `${pagination.total} request${
                  pagination.total !== 1 ? 's' : ''
                } found`}
          </p>
          <Link
            to="/post-request"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Post a Request
          </Link>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
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
                    </div>
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

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                    <FiMapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {request.lga}, {request.state}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-3">
                    <FiDollarSign className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                      {formatBudget(request.budget)}
                    </span>
                  </div>

                  {/* Bedrooms */}
                  {request.number_of_beds && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <FiBriefcase className="w-4 h-4" />
                      <span className="text-sm">
                        {request.number_of_beds} bedroom
                        {request.number_of_beds > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm">{request.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {request.accountType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  {/* Comments Preview */}
                  {request.comments && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {request.comments}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        <span>{request.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageCircle className="w-4 h-4" />
                        <span>{request._count?.responses || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Link
              to="/post-request"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Post the First Request
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => fetchRequests(pagination.current - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => fetchRequests(page)}
                    className={`px-4 py-2 rounded-lg ${
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
              onClick={() => fetchRequests(pagination.current + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => {
              setShowModal(false);
              setSelectedRequest(null);
            }}
            onUpdate={(updatedRequest) => {
              setRequests((prev) =>
                prev.map((req) =>
                  req.id === updatedRequest.id ? updatedRequest : req
                )
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ViewRequests;
