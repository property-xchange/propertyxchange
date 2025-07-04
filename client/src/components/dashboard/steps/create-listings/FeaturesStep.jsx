const FeaturesStep = ({
  formData,
  handleInputChange,
  hasParking,
  isServiced,
  isNewlyBuilt,
  isFurnished,
  handleBooleanChange,
  showMoreFeatures,
  moreFeatures,
  selectedFeatures,
  handleFeatureChange,
  listingFeatures,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Bedrooms *
          </label>
          <input
            type="number"
            name="number_of_beds"
            value={formData.number_of_beds}
            onChange={handleInputChange}
            min="0"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Bathrooms *
          </label>
          <input
            type="number"
            name="number_of_bathrooms"
            value={formData.number_of_bathrooms}
            onChange={handleInputChange}
            min="0"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Toilets *
          </label>
          <input
            type="number"
            name="toilets"
            value={formData.toilets}
            onChange={handleInputChange}
            min="0"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          Basic Features
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'parking', label: 'Parking Spot', value: hasParking },
            { key: 'serviced', label: 'Serviced', value: isServiced },
            { key: 'newlyBuilt', label: 'Newly Built', value: isNewlyBuilt },
            { key: 'furnished', label: 'Furnished', value: isFurnished },
          ].map((feature) => (
            <label
              key={feature.key}
              className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={feature.value}
                onChange={() => handleBooleanChange(feature.key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {feature.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={moreFeatures}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-3 underline"
        >
          {showMoreFeatures ? 'Hide' : 'Show'} Additional Features
        </button>
        {showMoreFeatures && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            {listingFeatures.map((feature) => (
              <label
                key={feature}
                className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesStep;
