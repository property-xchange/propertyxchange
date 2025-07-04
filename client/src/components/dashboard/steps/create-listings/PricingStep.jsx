const PricingStep = ({
  formData,
  handleInputChange,
  purpose,
  regularPrice,
  setRegularPrice,
  showDiscount,
  showInstallment,
  toggleDiscount,
  toggleInstallment,
  discountPrice,
  discountPercentage,
  handleDiscountPriceChange,
  handleDiscountPercentageChange,
  getCurrentDate,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Regular Price (₦) *
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={(e) => {
              handleInputChange(e);
              setRegularPrice(e.target.value);
            }}
            placeholder="e.g., 1000000"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
          {(purpose === 'rent' ||
            purpose === 'short-let' ||
            purpose === 'joint-venture') && (
            <select
              name="appendTo"
              value={formData.appendTo}
              onChange={handleInputChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select period</option>
              <option value="/month">/month</option>
              <option value="/year">/year</option>
              <option value="/sqm">/sqm</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={showDiscount}
              onChange={toggleDiscount}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Offer Discount
            </span>
          </label>

          {showDiscount && (
            <div className="space-y-3 pl-6 border-l-2 border-blue-200 dark:border-blue-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Discount Price (₦)
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={handleDiscountPriceChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={handleDiscountPercentageChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                  Discount End Date
                </label>
                <input
                  type="date"
                  name="discountEndDate"
                  value={formData.discountEndDate}
                  onChange={handleInputChange}
                  min={getCurrentDate()}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={showInstallment}
              onChange={toggleInstallment}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Allow Installments
            </span>
          </label>

          {showInstallment && (
            <div className="space-y-3 pl-6 border-l-2 border-green-200 dark:border-green-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Initial Payment (₦)
                  </label>
                  <input
                    type="number"
                    name="initialPayment"
                    value={formData.initialPayment}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Monthly Payment (₦)
                  </label>
                  <input
                    type="number"
                    name="monthlyPayment"
                    value={formData.monthlyPayment}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                    Period
                  </label>
                  <select
                    name="installmentAppendTo"
                    value={formData.installmentAppendTo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="/month">/month</option>
                    <option value="/year">/year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      {formData.price && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Pricing Summary
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Regular Price:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₦{parseInt(formData.price).toLocaleString()}
                {formData.appendTo}
              </span>
            </div>
            {showDiscount && discountPrice && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount Price:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ₦{parseInt(discountPrice).toLocaleString()}
                  {formData.appendTo}
                </span>
              </div>
            )}
            {showInstallment && formData.initialPayment && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Initial Payment:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  ₦{parseInt(formData.initialPayment).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingStep;
