import React, { useState, useEffect, Suspense } from 'react';
import Dashboard from './Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { closeFilterMenu, uiStore } from '../../redux/features/uiSlice';
import { Await, useLoaderData, Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import { MdPending, MdCheckCircle, MdCancel } from 'react-icons/md';
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
import PropertyLoader from '../../components/common/PropertyLoader';
import ListingPreviewModal from './ListingPreviewModal';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';

const UserListing = () => {
  const { postResponse } = useLoaderData();
  const { isFilterMenuOpen } = useSelector(uiStore);
  const dispatch = useDispatch();

  const [userListings, setUserListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelRef = React.useRef();

  const handlePreview = (listing) => {
    setSelectedListing(listing);
    onPreviewOpen();
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

      // Remove from local state
      setUserListings((prev) =>
        prev.filter((l) => l.id !== listingToDelete.id)
      );

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <MdCheckCircle className="text-green-500" />;
      case 'PENDING':
        return <MdPending className="text-yellow-500" />;
      case 'REJECTED':
        return <MdCancel className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dashboard>
      <div className="p-3 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Property Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your property listings
          </p>
        </div>

        <Suspense fallback={<PropertyLoader />}>
          <Await resolve={postResponse}>
            {(resolvedData) => {
              const listings = resolvedData?.data?.userListings || [];

              useEffect(() => {
                setUserListings(listings);
              }, [listings]);

              if (!listings || listings.length === 0) {
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FaEye className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No listings found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You haven't created any property listings yet.
                      </p>
                      <Link
                        to="/create-listing"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Your First Listing
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <FaEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resolvedData?.data?.stats?.totalListings || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <MdCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Approved
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resolvedData?.data?.stats?.approvedListings || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <MdPending className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pending
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resolvedData?.data?.stats?.pendingListings || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <FaStar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Featured
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resolvedData?.data?.stats?.featuredListings || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Listings Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Property
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {userListings.map((listing) => (
                            <tr
                              key={listing.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-16 w-20">
                                    <img
                                      className="h-16 w-20 rounded-lg object-cover"
                                      src={
                                        listing.images?.[0] ||
                                        '/placeholder-property.jpg'
                                      }
                                      alt={listing.name}
                                      onError={(e) => {
                                        e.target.src =
                                          '/placeholder-property.jpg';
                                      }}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {listing.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {listing.street}, {listing.lga}
                                    </div>
                                    <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{listing.number_of_beds} beds</span>
                                      <span>
                                        {listing.number_of_bathrooms} baths
                                      </span>
                                      <span>
                                        {listing.type.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatPrice(listing.price)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                  For {listing.purpose.toLowerCase()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      listing.status
                                    )}`}
                                  >
                                    {getStatusIcon(listing.status)}
                                    <span className="ml-1">
                                      {listing.status}
                                    </span>
                                  </span>
                                  {listing.isFeatured && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                      <FaStar className="w-3 h-3 mr-1" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(listing.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handlePreview(listing)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                                    title="Preview"
                                  >
                                    <FaEye className="w-4 h-4" />
                                  </button>

                                  <Link
                                    to={`/edit-listing/${listing.id}`}
                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </Link>

                                  <button
                                    onClick={() => handleDeleteClick(listing)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                    <AlertDialogOverlay
                      bg="blackAlpha.600"
                      backdropFilter="blur(4px)"
                    >
                      <AlertDialogContent
                        bg="white"
                        _dark={
                          ({ bg: 'gray.800' }, { borderColor: 'gray.600' })
                        }
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

                        <AlertDialogBody
                          color="gray.600"
                          _dark={{ color: 'gray.300' }}
                        >
                          Are you sure you want to delete "
                          {listingToDelete?.name}"?
                          <br />
                          <br />
                          <strong>This action cannot be undone.</strong> The
                          listing and all associated data will be permanently
                          removed.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                          <Button
                            ref={cancelRef}
                            onClick={onDeleteClose}
                            variant="ghost"
                            _hover={{
                              bg: 'gray.100',
                              _dark: { bg: 'gray.700' },
                            }}
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
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </Dashboard>
  );
};

export default UserListing;
