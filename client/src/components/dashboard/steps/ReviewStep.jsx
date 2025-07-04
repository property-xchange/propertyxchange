import {
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  DollarSign,
  Home,
} from 'lucide-react';

const ReviewStep = ({
  formData,
  selectedType,
  selectedSubType,
  purpose,
  selectedState,
  selectedLGA,
  images,
  selectedFeatures,
  hasParking,
  isServiced,
  isNewlyBuilt,
  isFurnished,
  showDiscount,
  showInstallment,
  discountPrice,
}) => {
  const basicFeatures = [];
  if (hasParking) basicFeatures.push('Parking');
  if (isServiced) basicFeatures.push('Serviced');
  if (isNewlyBuilt) basicFeatures.push('Newly Built');
  if (isFurnished) basicFeatures.push('Furnished');

  const allFeatures = [...basicFeatures, ...selectedFeatures];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            Review Your Listing
          </h3>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Please review all information carefully before submitting. Once
          published, your listing will be visible to potential buyers/renters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Home className="text-gray-600 dark:text-gray-400" size={18} />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Property:
              </span>
              <p className="text-gray-900 dark:text-white">{formData.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Type:
              </span>
              <p className="text-gray-900 dark:text-white">
                {selectedType} {selectedSubType && `- ${selectedSubType}`}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Purpose:
              </span>
              <p className="text-gray-900 dark:text-white capitalize">
                {purpose}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Rooms:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formData.number_of_beds} beds, {formData.number_of_bathrooms}{' '}
                baths, {formData.toilets} toilets
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="text-gray-600 dark:text-gray-400" size={18} />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Location
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Address:
              </span>
              <p className="text-gray-900 dark:text-white">{formData.street}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Area:
              </span>
              <p className="text-gray-900 dark:text-white">
                {selectedLGA}, {selectedState}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Coordinates:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formData.latitude}, {formData.longitude}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign
              className="text-gray-600 dark:text-gray-400"
              size={18}
            />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Pricing
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Regular Price:
              </span>
              <p className="text-gray-900 dark:text-white">
                ₦{parseInt(formData.price).toLocaleString()}
                {formData.appendTo}
              </p>
            </div>
            {showDiscount && discountPrice && (
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Discount Price:
                </span>
                <p className="text-green-600 dark:text-green-400">
                  ₦{parseInt(discountPrice).toLocaleString()}
                  {formData.appendTo}
                </p>
              </div>
            )}
            {showInstallment && formData.initialPayment && (
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Installment:
                </span>
                <p className="text-blue-600 dark:text-blue-400">
                  ₦{parseInt(formData.initialPayment).toLocaleString()} initial
                  {formData.monthlyPayment && (
                    <>
                      , ₦{parseInt(formData.monthlyPayment).toLocaleString()}
                      {formData.installmentAppendTo}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Camera className="text-gray-600 dark:text-gray-400" size={18} />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Media
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Images:
              </span>
              <p
                className={`${
                  images.length > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {images.length} uploaded{' '}
                {images.length === 0 ? '(Required)' : ''}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Social Links:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formData.instagramLink || formData.youtubeLink
                  ? 'Added'
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      {allFeatures.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {allFeatures.slice(0, 8).map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {allFeatures.length > 8 && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{allFeatures.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Validation Check */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle
            className="text-yellow-600 dark:text-yellow-400"
            size={18}
          />
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
            Pre-submission Checklist
          </h4>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={16}
              className={formData.name ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={
                formData.name
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              Property title provided
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={16}
              className={selectedType ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={
                selectedType
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              Property type selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={16}
              className={
                formData.street && selectedState
                  ? 'text-green-600'
                  : 'text-gray-400'
              }
            />
            <span
              className={
                formData.street && selectedState
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              Location details provided
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={16}
              className={formData.price ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={
                formData.price
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              Pricing information added
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={16}
              className={images.length > 0 ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={
                images.length > 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              Property images uploaded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
