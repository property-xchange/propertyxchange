import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaDownload } from 'react-icons/fa';
import { User, Building, FileText, CheckCircle, XCircle } from 'lucide-react';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';

const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get(
        '/user/admin?verified=false&profileCompleted=true'
      );
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, verified = true) => {
    try {
      await apiRequest.put(`/user/admin/${userId}/verify`, { verified });
      toast.success(`User ${verified ? 'verified' : 'rejected'} successfully`);
      fetchPendingUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Verification Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.phoneNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    WhatsApp
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.whatsAppNum}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Type
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {user.accountType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.lga}, {user.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            {user.accountType !== 'individual' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.companyName || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.companyEmail || 'Not provided'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      About Company
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.aboutCompany || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {user.accountType !== 'individual' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Documents
                </h3>
                <div className="space-y-3">
                  {user.companyRegDocument && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Registration Document
                      </span>
                      <div className="flex space-x-2">
                        <a
                          href={user.companyRegDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          <FaEye />
                        </a>
                        <a
                          href={user.companyRegDocument}
                          download
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  )}
                  {user.businessLicense && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business License
                      </span>
                      <div className="flex space-x-2">
                        <a
                          href={user.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          <FaEye />
                        </a>
                        <a
                          href={user.businessLicense}
                          download
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  )}
                  {user.taxCertificate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Certificate
                      </span>
                      <div className="flex space-x-2">
                        <a
                          href={user.taxCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          <FaEye />
                        </a>
                        <a
                          href={user.taxCertificate}
                          download
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => handleVerifyUser(user.id, false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
            <button
              onClick={() => handleVerifyUser(user.id, true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Verify User</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and verify user profiles pending approval
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">
            No users pending verification
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.profilePhoto || '/default-avatar.png'}
                          alt={user.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lga}, {user.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, true)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, false)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserDetailsModal
        user={selectedUser}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserVerification;
