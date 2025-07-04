import TextEditor from '../../../common/page-components/TextEditor';

const BasicInfoStep = ({
  formData,
  handleInputChange,
  selectedType,
  selectedSubType,
  purpose,
  description,
  setDescription,
  handleTypeChange,
  handleSubTypeChange,
  handleCheckboxChange,
  listingType,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Property Title *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Furnished 2 Bedroom Duplex"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength="62"
          minLength="10"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Type *
          </label>
          <select
            value={selectedType || ''}
            onChange={handleTypeChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Type</option>
            {listingType.map((item) => (
              <option key={item.type} value={item.type}>
                {item.type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            SubType (Optional)
          </label>
          <select
            value={selectedSubType || ''}
            onChange={handleSubTypeChange}
            disabled={!selectedType}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select SubType</option>
            {listingType
              .find((item) => item.type === selectedType)
              ?.subType.map((subType) => (
                <option key={subType} value={subType}>
                  {subType}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          Purpose *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['sale', 'rent', 'short-let', 'joint-venture'].map(
            (purposeOption) => (
              <label
                key={purposeOption}
                className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={purpose === purposeOption}
                  onChange={() => handleCheckboxChange(purposeOption)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="capitalize text-gray-700 dark:text-gray-300 font-medium">
                  {purposeOption.replace('-', ' ')}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <div className="w-full">
          <TextEditor
            initialValue={description}
            onChange={(newValue) => setDescription(newValue)}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Provide a detailed description of your property
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
