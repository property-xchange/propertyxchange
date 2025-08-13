import React, { useState, useContext } from 'react';
import {
  FaTrash,
  FaUserSlash,
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaChartBar,
} from 'react-icons/fa';
import { MdVerified, MdBusiness } from 'react-icons/md';
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
import { AuthContext } from '../context/AuthContext';
import apiRequest from '../helper/apiRequest';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';

const AccountSettings = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // UI state
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isDeactivateOpen,
    onOpen: onDeactivateOpen,
    onClose: onDeactivateClose,
  } = useDisclosure();
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const cancelRef = React.useRef();

  React.useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/user/profileListings');
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmationPassword.trim()) {
      toast.error('Please enter your password to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);

      await apiRequest.delete(`/user/${currentUser.id}`, {
        data: { confirmationPassword },
      });

      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setConfirmationPassword('');
      onDeleteClose();
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      setIsDeactivating(true);

      await apiRequest.put(`/user/${currentUser.id}/deactivate`);

      toast.success('Account deactivated successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deactivating account:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to deactivate account';
      toast.error(errorMessage);
    } finally {
      setIsDeactivating(false);
      onDeactivateClose();
    }
  };

  const hasActiveContent =
    userStats && (userStats.totalListings > 0 || userStats.totalSaved > 0);

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      STAFF:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      USER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[role] || colors.USER;
  };

  const getAccountTypeBadge = (type) => {
    const colors = {
      INDIVIDUAL:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      LAW: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      SURVEY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      ORGANIZATION:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      DEVELOPER:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      INVESTOR:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[type] || colors.INDIVIDUAL;
  };

  return (
    <Dashboard>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                  {currentUser?.profilePhoto ? (
                    <img
                      src={currentUser.profilePhoto}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentUser?.firstName || currentUser?.username || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentUser?.email}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                        currentUser?.role
                      )}`}
                    >
                      {currentUser?.role || 'USER'}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeBadge(
                        currentUser?.accountType
                      )}`}
                    >
                      {currentUser?.accountType?.replace('_', ' ') ||
                        'INDIVIDUAL'}
                    </span>
                    {currentUser?.verified && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center">
                        <MdVerified className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>
                    Member since{' '}
                    {new Date(currentUser?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MdBusiness className="w-4 h-4" />
                  <span>{currentUser?.companyName || 'No company'}</span>
                </div>
              </div>
            </div>

            {/* Activity Statistics */}
            {userStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FaChartBar className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Activity
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userStats.totalListings}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Listings
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userStats.approvedListings}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Approved
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {userStats.pendingListings}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Pending
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {userStats.totalSaved}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Saved Properties
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions Sidebar */}
          <div className="space-y-6">
            {/* Deactivate Account */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                  <FaUserSlash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Deactivate Account
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Temporarily disable your account. You can reactivate it later by
                contacting support. Your data will be preserved.
              </p>
              <button
                onClick={onDeactivateOpen}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Deactivate Account
              </button>
            </div>

            {/* Delete Account */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                  <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
              </div>

              {hasActiveContent && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Active Content Detected!
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        You have {userStats?.totalListings} active listings and{' '}
                        {userStats?.totalSaved} saved properties.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>

              <button
                onClick={onDeleteOpen}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Account Permanently
              </button>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help?
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                If you're having issues with your account, consider contacting
                our support team before taking any permanent actions. We're here
                to help resolve any problems you might be experiencing.
              </p>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Dialog */}
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
                color="red.600"
                _dark={{ color: 'red.400' }}
              >
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle />
                  <span>Delete Account</span>
                </div>
              </AlertDialogHeader>

              <AlertDialogBody>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      ⚠️ This action is irreversible!
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      All your account data, listings, and saved properties will
                      be permanently deleted.
                    </p>
                  </div>

                  {hasActiveContent && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        You will lose:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                        <li>{userStats?.totalListings} property listings</li>
                        <li>{userStats?.totalSaved} saved properties</li>
                        <li>All account history and data</li>
                      </ul>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter your password to confirm:
                    </label>
                    <input
                      type="password"
                      placeholder="Your account password"
                      value={confirmationPassword}
                      onChange={(e) => setConfirmationPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <p className="text-sm italic text-gray-600 dark:text-gray-400">
                    Type your password and click "Delete Account" to permanently
                    delete your account.
                  </p>
                </div>
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
                  onClick={handleDeleteAccount}
                  ml={3}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  isDisabled={!confirmationPassword.trim()}
                >
                  Delete Account
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Deactivate Account Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeactivateOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeactivateClose}
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
                color="orange.600"
                _dark={{ color: 'orange.400' }}
              >
                <div className="flex items-center space-x-2">
                  <FaUserSlash />
                  <span>Deactivate Account</span>
                </div>
              </AlertDialogHeader>

              <AlertDialogBody>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Temporary Deactivation
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your account will be temporarily disabled. Your data will
                      be preserved and you can reactivate your account by
                      contacting support.
                    </p>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to deactivate your account? You'll be
                    logged out and won't be able to access your account until
                    it's reactivated.
                  </p>
                </div>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onDeactivateClose}
                  variant="ghost"
                  _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="orange"
                  onClick={handleDeactivateAccount}
                  ml={3}
                  isLoading={isDeactivating}
                  loadingText="Deactivating..."
                >
                  Deactivate Account
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </div>
    </Dashboard>
  );
};

export default AccountSettings;
