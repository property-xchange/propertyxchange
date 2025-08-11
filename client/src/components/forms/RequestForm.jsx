import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import {
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiMessageSquare,
  FiUser,
  FiMail,
  FiPhone,
} from 'react-icons/fi';

const RequestForm = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    type: '',
    subType: '',
    state: '',
    lga: '',
    number_of_beds: '',
    budget: '',
    comments: '',
    name: '',
    email: '',
    phoneNumber: '',
    accountType: 'INDIVIDUAL',
    expiresAt: '',
  });

  // Auto-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name:
          currentUser.firstName && currentUser.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : currentUser.username,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber || '',
        accountType: currentUser.accountType || 'INDIVIDUAL',
      }));
    }
  }, [currentUser]);

  const purposeOptions = [
    { value: 'RENT', label: 'Rent' },
    { value: 'SALE', label: 'Sale' },
    { value: 'SHORT_LET', label: 'Short Let' },
    { value: 'JOINT_VENTURE', label: 'Joint Venture' },
  ];

  const typeOptions = [
    { value: 'CO_WORKING_SPACE', label: 'Co-working Space' },
    { value: 'COMMERCIAL_PROPERTY', label: 'Commercial Property' },
    { value: 'FLAT_APARTMENT', label: 'Flat/Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'LAND', label: 'Land' },
  ];

  const accountTypeOptions = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'ORGANIZATION', label: 'Organization' },
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'LAW', label: 'Law Firm' },
    { value: 'SURVEY', label: 'Estate Surveying Firm' },
    { value: 'INVESTOR', label: 'Investor' },
    { value: 'OTHER', label: 'Other' },
  ];

  const subTypeOptions = {
    CO_WORKING_SPACE: [
      { value: 'CONFERENCE_ROOM', label: 'Conference Room' },
      { value: 'DESK', label: 'Desk' },
      { value: 'MEETING_ROOM', label: 'Meeting Room' },
      { value: 'PRIVATE_OFFICE', label: 'Private Office' },
      { value: 'WORKSTATION', label: 'Workstation' },
    ],
    COMMERCIAL_PROPERTY: [
      { value: 'CHURCH', label: 'Church' },
      { value: 'EVENT_CENTER', label: 'Event Center' },
      { value: 'FACTORY', label: 'Factory' },
      { value: 'FILLING_STATION', label: 'Filling Station' },
      { value: 'HOTEL_GUEST_HOUSE', label: 'Hotel/Guest House' },
      { value: 'OFFICE_SPACE', label: 'Office Space' },
      { value: 'SCHOOL', label: 'School' },
      { value: 'SHOP', label: 'Shop' },
      { value: 'SHOP_IN_MALL', label: 'Shop in Mall' },
      { value: 'SHOW_ROOM', label: 'Show Room' },
      { value: 'TANK_FARM', label: 'Tank Farm' },
      { value: 'WAREHOUSE', label: 'Warehouse' },
    ],
    FLAT_APARTMENT: [
      { value: 'BOYS_QUARTER', label: 'Boys Quarter' },
      { value: 'MINI_FLAT', label: 'Mini Flat' },
      { value: 'PENTHOUSE', label: 'Penthouse' },
      { value: 'SELF_CONTAIN', label: 'Self Contain' },
      { value: 'SHARED_APARTMENT', label: 'Shared Apartment' },
      { value: 'STUDIO_APARTMENT', label: 'Studio Apartment' },
    ],
    HOUSE: [
      { value: 'BLOCK_OF_FLATS', label: 'Block of Flats' },
      { value: 'DETACHED_BUNGALOW', label: 'Detached Bungalow' },
      { value: 'DETACHED_DUPLEX', label: 'Detached Duplex' },
      { value: 'MASSIONETTE', label: 'Massionette' },
      { value: 'SEMI_DETACHED_BUNGALOW', label: 'Semi Detached Bungalow' },
      { value: 'SEMI_DETACHED_DUPLEX', label: 'Semi Detached Duplex' },
      { value: 'TERRACED_BUNGALOW', label: 'Terraced Bungalow' },
      { value: 'TERRACED_DUPLEX', label: 'Terraced Duplex' },
    ],
    LAND: [
      { value: 'COMMERCIAL_LAND', label: 'Commercial Land' },
      { value: 'INDUSTRIAL_LAND', label: 'Industrial Land' },
      { value: 'JOINT_VENTURE_LAND', label: 'Joint Venture Land' },
      { value: 'MIXED_USE_LAND', label: 'Mixed Use Land' },
      { value: 'RESIDENTIAL_LAND', label: 'Residential Land' },
      {
        value: 'SERVICED_RESIDENTIAL_LAND',
        label: 'Serviced Residential Land',
      },
    ],
  };

  const nigerianStates = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'FCT',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
  ];

  const bedroomOptions = [
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4 Bedrooms' },
    { value: '5', label: '5 Bedrooms' },
    { value: '6', label: '6+ Bedrooms' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset subType when type changes
      ...(name === 'type' && { subType: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        'purpose',
        'type',
        'state',
        'lga',
        'budget',
        'name',
        'email',
        'phoneNumber',
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate budget
      if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
        toast.error('Please enter a valid budget amount');
        setLoading(false);
        return;
      }

      // Set expiration date to 30 days from now if not provided
      const requestData = {
        ...formData,
        budget: parseFloat(formData.budget),
        number_of_beds: formData.number_of_beds
          ? parseInt(formData.number_of_beds)
          : null,
        expiresAt:
          formData.expiresAt ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await apiRequest.post('/request', requestData);

      if (response.data.success) {
        toast.success('Property request submitted successfully!');
        navigate('/property-request');
      }
    } catch (error) {
      console.error('Submit request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Post a Property Request
            </h1>
            <p className="text-primary-100">
              Tell us what property you're looking for and let agents come to
              you
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Property Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FiBriefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Property Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {purposeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubType */}
                {formData.type && subTypeOptions[formData.type] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub Type
                    </label>
                    <select
                      name="subType"
                      value={formData.subType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Sub Type</option>
                      {subTypeOptions[formData.type].map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Location
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LGA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LGA *
                  </label>
                  <input
                    type="text"
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter LGA"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Property Specifications Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FiDollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Specifications & Budget
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Bedrooms
                  </label>
                  <select
                    name="number_of_beds"
                    value={formData.number_of_beds}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Bedrooms</option>
                    {bedroomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget (₦) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    placeholder="Enter your budget"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe any specific requirements or preferences..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    disabled={currentUser} // Disabled if user is logged in
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {accountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {currentUser && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Account type is set from your profile
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Expiration Date
                </label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to auto-expire after 30 days
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
