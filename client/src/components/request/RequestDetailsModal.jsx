import React, { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import {
  FiX,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCalendar,
  FiEye,
  FiBriefcase,
  FiSend,
  FiExternalLink,
} from 'react-icons/fi';

const RequestDetailsModal = ({ request, onClose, onUpdate }) => {
  const { currentUser } = useContext(AuthContext);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState({
    message: '',
    contactEmail: currentUser?.email || '',
    contactPhone: currentUser?.phoneNumber || '',
    proposedPrice: '',
    listingId: '',
  });

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please login to respond to requests');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest.post(`/request/${request.id}/respond`, {
        ...responseData,
        proposedPrice: responseData.proposedPrice
          ? parseFloat(responseData.proposedPrice)
          : null,
      });

      if (response.data.success) {
        toast.success('Response submitted successfully!');
        setShowResponseForm(false);
        setResponseData({
          message: '',
          contactEmail: currentUser?.email || '',
          contactPhone: currentUser?.phoneNumber || '',
          proposedPrice: '',
          listingId: '',
        });

        // Refresh the request data to show the new response
        const updatedRequest = await apiRequest.get(`/request/${request.id}`);
        if (updatedRequest.data.success) {
          onUpdate(updatedRequest.data.data);
        }
      }
    } catch (error) {
      console.error('Submit response error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  const canRespond =
    currentUser &&
    request.status === 'OPEN' &&
    !request.responses?.some(
      (response) => response.agent.id === currentUser.id
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Property Request Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {request.type
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              {request.subType &&
                ` - ${request.subType
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Request Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status.toLowerCase()}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiMapPin className="w-5 h-5 text-primary" />
                  <span>
                    {request.lga}, {request.state}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <FiDollarSign className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">
                    {formatBudget(request.budget)}
                  </span>
                </div>

                {request.number_of_beds && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <FiBriefcase className="w-5 h-5 text-primary" />
                    <span>
                      {request.number_of_beds} bedroom
                      {request.number_of_beds > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiEye className="w-5 h-5 text-primary" />
                  <span>
                    {request.viewCount} view{request.viewCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiCalendar className="w-5 h-5 text-primary" />
                  <span>Posted on {formatDate(request.createdAt)}</span>
                </div>

                {request.expiresAt && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <FiCalendar className="w-5 h-5 text-orange-500" />
                    <span>Expires on {formatDate(request.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiUser className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">{request.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {request.accountType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiMail className="w-5 h-5 text-primary" />
                  <a
                    href={`mailto:${request.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {request.email}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FiPhone className="w-5 h-5 text-primary" />
                  <a
                    href={`tel:${request.phoneNumber}`}
                    className="hover:text-primary transition-colors"
                  >
                    {request.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {request.comments && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-primary" />
                Additional Requirements
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {request.comments}
                </p>
              </div>
            </div>
          )}

          {/* Responses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Responses ({request.responses?.length || 0})
              </h3>
              {canRespond && !showResponseForm && (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Respond to Request
                </button>
              )}
            </div>

            {/* Response Form */}
            {showResponseForm && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Submit Your Response
                </h4>
                <form onSubmit={handleSubmitResponse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={responseData.message}
                      onChange={(e) =>
                        setResponseData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      required
                      rows={4}
                      placeholder="Describe how you can help with this request..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={responseData.contactEmail}
                        onChange={(e) =>
                          setResponseData((prev) => ({
                            ...prev,
                            contactEmail: e.target.value,
                          }))
                        }
                        placeholder="Your contact email"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={responseData.contactPhone}
                        onChange={(e) =>
                          setResponseData((prev) => ({
                            ...prev,
                            contactPhone: e.target.value,
                          }))
                        }
                        placeholder="Your contact phone"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proposed Price (Optional)
                      </label>
                      <input
                        type="number"
                        value={responseData.proposedPrice}
                        onChange={(e) =>
                          setResponseData((prev) => ({
                            ...prev,
                            proposedPrice: e.target.value,
                          }))
                        }
                        placeholder="Your proposed price"
                        min="0"
                        step="1000"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Related Listing ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={responseData.listingId}
                        onChange={(e) =>
                          setResponseData((prev) => ({
                            ...prev,
                            listingId: e.target.value,
                          }))
                        }
                        placeholder="ID of your property listing"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FiSend className="w-4 h-4" />
                      {loading ? 'Submitting...' : 'Submit Response'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResponseForm(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Responses */}
            {request.responses?.length > 0 ? (
              <div className="space-y-4">
                {request.responses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            response.agent.profilePhoto || '/default-avatar.png'
                          }
                          alt={response.agent.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {response.agent.firstName && response.agent.lastName
                              ? `${response.agent.firstName} ${response.agent.lastName}`
                              : response.agent.username}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {response.agent.accountType
                                .replace(/_/g, ' ')
                                .toLowerCase()}
                            </span>
                            {response.agent.verified && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                      {response.message}
                    </p>

                    {response.proposedPrice && (
                      <div className="flex items-center gap-2 mb-3">
                        <FiDollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Proposed Price: {formatBudget(response.proposedPrice)}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {response.contactEmail && (
                        <a
                          href={`mailto:${response.contactEmail}`}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FiMail className="w-4 h-4" />
                          Email Agent
                        </a>
                      )}

                      {response.contactPhone && (
                        <a
                          href={`tel:${response.contactPhone}`}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FiPhone className="w-4 h-4" />
                          Call Agent
                        </a>
                      )}

                      {response.listing && (
                        <a
                          href={`/property/${response.listing.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          View Property
                        </a>
                      )}
                    </div>

                    {response.listing && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Related Property
                        </h5>
                        <div className="flex items-center gap-3">
                          {response.listing.images?.[0] && (
                            <img
                              src={response.listing.images[0]}
                              alt={response.listing.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {response.listing.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatBudget(response.listing.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No responses yet</p>
                {canRespond && (
                  <p className="text-sm mt-1">
                    Be the first to respond to this request!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Login Prompt for Non-authenticated Users */}
          {!currentUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Want to respond to this request?
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Please log in to submit a response and connect with the
                    requester.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <a
                  href="/sign-in"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Register
                </a>
              </div>
            </div>
          )}

          {/* Already Responded Message */}
          {currentUser &&
            request.responses?.some(
              (response) => response.agent.id === currentUser.id
            ) && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      You have already responded to this request
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your response is visible above. The requester can contact
                      you directly.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Request Closed Message */}
          {(request.status === 'CLOSED' || request.status === 'EXPIRED') && (
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiCalendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    This request is {request.status.toLowerCase()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {request.status === 'CLOSED'
                      ? 'The requester has closed this request.'
                      : 'This request has expired and is no longer accepting responses.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
