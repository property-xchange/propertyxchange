import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Eye } from 'lucide-react';
import { TbBed, TbBath } from 'react-icons/tb';
import { PiToilet } from 'react-icons/pi';
import { Link } from 'react-router-dom';

const ListingPreviewModal = ({ listing, isOpen, onClose }) => {
  if (!listing || !isOpen) return null;

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {listing.name}
              </h2>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  listing.status
                )}`}
              >
                {listing.status}
              </span>
              {listing.isFeatured && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Featured
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Images */}
              <div>
                <div className="aspect-video rounded-lg overflow-hidden mb-4 border border-gray-200 dark:border-gray-600">
                  <img
                    src={listing.images?.[0] || '/placeholder-property.jpg'}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-property.jpg';
                    }}
                  />
                </div>
                {listing.images && listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
                      >
                        <img
                          src={image}
                          alt={`Property ${index + 2}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-property.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Location */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Location
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>
                      {listing.street}, {listing.lga}, {listing.state}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                        <TbBed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bedrooms
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {listing.number_of_beds}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                        <TbBath className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bathrooms
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {listing.number_of_bathrooms}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                        <PiToilet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toilets
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {listing.toilets}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Price:
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(listing.price)}
                        {listing.appendTo && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            {listing.appendTo}
                          </span>
                        )}
                      </span>
                    </div>
                    {listing.offer && listing.discountPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          Discount Price:
                        </span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatPrice(listing.discountPrice)}
                          {listing.appendTo && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {listing.appendTo}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Type:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {listing.type.replace(/_/g, ' ')}{' '}
                        {listing.subType &&
                          `- ${listing.subType.replace(/_/g, ' ')}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Purpose:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {listing.purpose.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Created:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        key: 'furnished',
                        label: 'Furnished',
                        value: listing.furnished,
                      },
                      {
                        key: 'serviced',
                        label: 'Serviced',
                        value: listing.serviced,
                      },
                      {
                        key: 'parking',
                        label: 'Parking',
                        value: listing.parking,
                      },
                      {
                        key: 'newlyBuilt',
                        label: 'Newly Built',
                        value: listing.newlyBuilt,
                      },
                    ].map((amenity) => (
                      <div
                        key={amenity.key}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            amenity.value
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-500'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            amenity.value
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {amenity.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.features.slice(0, 12).map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-full border border-gray-200 dark:border-gray-500"
                    >
                      {feature}
                    </span>
                  ))}
                  {listing.features.length > 12 && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                      +{listing.features.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {listing.description}
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {listing.status === 'REJECTED' && listing.rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Rejection Reason
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {listing.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ID: {listing.id}
                {listing.updatedAt &&
                  listing.updatedAt !== listing.createdAt && (
                    <span className="ml-4">
                      Last updated:{' '}
                      {new Date(listing.updatedAt).toLocaleDateString()}
                    </span>
                  )}
              </div>
              <div className="flex space-x-3">
                {listing.status === 'APPROVED' && (
                  <Link
                    to={`/property/${listing.slug || listing.id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    <span>View Live</span>
                  </Link>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListingPreviewModal;
