import { MapPin } from 'lucide-react';

const LocationStep = ({
  formData,
  handleInputChange,
  selectedState,
  selectedLGA,
  handleStateChange,
  handleLGAChange,
  locationData,
  handleGetCurrentLocation,
  isGettingLocation,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            State *
          </label>
          <select
            value={selectedState || ''}
            onChange={handleStateChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select State</option>
            {locationData.map((location) => (
              <option key={location.state} value={location.state}>
                {location.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Local Government Area *
          </label>
          <select
            value={selectedLGA || ''}
            onChange={handleLGAChange}
            disabled={!selectedState}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select LGA</option>
            {locationData
              .find((location) => location.state === selectedState)
              ?.lga.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Street Address *
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          placeholder="Enter street address"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Coordinates *
          </label>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isGettingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <MapPin size={16} />
                <span>Use Current Location</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
              Latitude
            </label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="e.g., 9.0623438"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
              Longitude
            </label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="e.g., 7.5188337"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter coordinates in decimal format only. Click "Use Current Location"
          to automatically detect your coordinates.
        </p>
      </div>

      {/* Location Preview */}
      {formData.latitude && formData.longitude && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Location Preview
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Coordinates: {formData.latitude}, {formData.longitude}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Make sure these coordinates accurately represent your property
            location.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationStep;
