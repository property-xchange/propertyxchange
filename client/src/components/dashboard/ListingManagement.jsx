import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaEdit,
  FaStar,
  FaTrash,
} from 'react-icons/fa';
import { MdPending, MdApproval } from 'react-icons/md';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';
import Dashboard from './Dashboard';
import ListingPreviewModal from './ListingPreviewModal';

const ListingManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    purpose: '',
    type: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Modal states
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const [listingToDelete, setListingToDelete] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(
        `/listing/admin/all?${queryParams}`
      );
      setListings(response.data.listings || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest.get('/listing/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePreview = (listing) => {
    setSelectedListing(listing);
    onPreviewOpen();
  };

  const handleApprove = async (listingId) => {
    try {
      await apiRequest.put(`/listing/admin/${listingId}/approve`);
      toast.success('Listing approved successfully');
      fetchListings();
      fetchStats();
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Failed to approve listing');
    }
  };

  const handleReject = async (listingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await apiRequest.put(`/listing/admin/${listingId}/reject`, { reason });
      toast.success('Listing rejected successfully');
      fetchListings();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleToggleFeatured = async (listingId, currentStatus) => {
    try {
      await apiRequest.put(`/listing/admin/${listingId}/featured`, {
        isFeatured: !currentStatus,
      });
      toast.success(
        `Listing ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      );
      fetchListings();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDeleteClick = (listing) => {
    setListingToDelete(listing);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      setIsDeleting(true);
      await apiRequest.delete(`/listing/${listingToDelete.id}`);
      toast.success('Listing deleted successfully');
      fetchListings();
      fetchStats();
      onDeleteClose();
      setListingToDelete(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to delete listing';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteListing = (listing) => {
    // Admin can delete any listing
    if (currentUser?.role === 'ADMIN') return true;

    // Staff can delete any listing (optional - remove this if staff shouldn't delete)
    if (currentUser?.role === 'STAFF') return true;

    // Users can only delete their own listings
    return listing.user?.id === currentUser?.id;
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
    <Dashboard>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Listing Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage property listings
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Listings"
            value={stats.totalListings}
            icon={MdPending}
            color="bg-blue-500"
          />
          <StatCard
            title="Approved"
            value={stats.approvedListings}
            icon={FaCheck}
            color="bg-green-500"
          />
          <StatCard
            title="Pending"
            value={stats.pendingListings}
            icon={MdApproval}
            color="bg-yellow-500"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedListings}
            icon={FaTimes}
            color="bg-red-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
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
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
            >
              <option value="">All Purposes</option>
              <option value="RENT">Rent</option>
              <option value="SALE">Sale</option>
              <option value="JOINT_VENTURE">Joint Venture</option>
              <option value="SHORT_LET">Short Let</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="HOUSE">House</option>
              <option value="FLAT_APARTMENT">Flat/Apartment</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL_PROPERTY">Commercial</option>
              <option value="CO_WORKING_SPACE">Co-working Space</option>
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

        {/* Listings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500 dark:text-gray-400">
                No listings found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              listing.images?.[0] || '/placeholder-property.jpg'
                            }
                            alt={listing.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {listing.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {listing.street}, {listing.lga}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              listing.user?.profilePhoto ||
                              '/default-avatar.png'
                            }
                            alt={listing.user?.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {listing.user?.firstName ||
                                listing.user?.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {listing.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₦{listing.price?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              listing.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : listing.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {listing.status}
                          </span>
                          {listing.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(listing.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Preview Button - Now opens modal instead of direct link */}
                          <button
                            onClick={() => handlePreview(listing)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            title="Preview"
                          >
                            <FaEye />
                          </button>

                          {/* Featured Toggle */}
                          <button
                            onClick={() =>
                              handleToggleFeatured(
                                listing.id,
                                listing.isFeatured
                              )
                            }
                            className={`${
                              listing.isFeatured
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-400 dark:text-gray-500'
                            } hover:text-yellow-700 transition-colors`}
                            title={
                              listing.isFeatured
                                ? 'Remove from featured'
                                : 'Add to featured'
                            }
                          >
                            <FaStar />
                          </button>

                          {listing.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(listing.id)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleReject(listing.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          {/* Delete Button - Only show if user has permission */}
                          {canDeleteListing(listing) && (
                            <button
                              onClick={() => handleDeleteClick(listing)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                              title="Delete Listing"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* Preview Modal */}
        {selectedListing && (
          <ListingPreviewModal
            listing={selectedListing}
            isOpen={isPreviewOpen}
            onClose={() => {
              onPreviewClose();
              setSelectedListing(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
          isCentered
        >
          <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
            <AlertDialogContent
              bg="white"
              _dark={({ bg: 'gray.800' }, { borderColor: 'gray.600' })}
              border="1px"
              borderColor="gray.200"
            >
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: 'white' }}
              >
                Delete Listing
              </AlertDialogHeader>

              <AlertDialogBody color="gray.600" _dark={{ color: 'gray.300' }}>
                Are you sure you want to delete "{listingToDelete?.name}"?
                <br />
                <br />
                <strong>This action cannot be undone.</strong> The listing and
                all associated data will be permanently removed.
                {listingToDelete?.user?.id !== currentUser?.id && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> You are deleting another user's
                      listing. The owner will be notified of this action.
                    </p>
                  </div>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onDeleteClose}
                  variant="ghost"
                  _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteConfirm}
                  ml={3}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </div>
    </Dashboard>
  );
};

export default ListingManagement;
