import React from 'react';
import { MapPin, Home } from 'lucide-react';

const LocationStep = ({
  selectedState,
  selectedLGA,
  handleStateChange,
  handleLGAChange,
  formData,
  handleInputChange,
  locationData,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Location Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Provide your location details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin size={16} className="inline mr-2" />
            State *
          </label>
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin size={16} className="inline mr-2" />
            LGA *
          </label>
          <select
            value={selectedLGA}
            onChange={handleLGAChange}
            disabled={!selectedState}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Home size={16} className="inline mr-2" />
          Address *
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your full address"
          required
        />
      </div>
    </div>
  );
};

export default LocationStep;
