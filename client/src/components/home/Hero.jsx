import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  Filter,
  Bed,
  Bath,
  Car,
} from 'lucide-react';
import { locationData } from '../../data/dummyData';

// Updated to match Prisma schema enums
const propertyTypes = [
  { value: 'CO_WORKING_SPACE', label: 'Co-working Space' },
  { value: 'COMMERCIAL_PROPERTY', label: 'Commercial Property' },
  { value: 'FLAT_APARTMENT', label: 'Flat/Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'LAND', label: 'Land' },
];

const propertySubTypes = {
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
    { value: 'HOTEL_GUEST_HOUSE', label: 'Hotel Guest House' },
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
    { value: 'SERVICED_RESIDENTIAL_LAND', label: 'Serviced Residential Land' },
  ],
};

// Updated to match Prisma schema ListingCategory enum
const purposes = [
  { value: 'SALE', label: 'Sale' },
  { value: 'RENT', label: 'Rent' },
  { value: 'SHORT_LET', label: 'Short Let' },
  { value: 'JOINT_VENTURE', label: 'Joint Venture' },
];

const priceRanges = [
  { label: '₦100K - ₦1M', min: 100000, max: 1000000 },
  { label: '₦1M - ₦5M', min: 1000000, max: 5000000 },
  { label: '₦5M - ₦10M', min: 5000000, max: 10000000 },
  { label: '₦10M - ₦50M', min: 10000000, max: 50000000 },
  { label: '₦50M+', min: 50000000, max: null },
];

const features = [
  'Boys-Quarter',
  'Children Playing Ground',
  'Free Coffee',
  'Security',
  'Excision',
  'Free Wifi',
  'Parking Space',
  'Gym',
  'Swimming pool',
  'Church Nearby',
  'Child Care',
  'Restaurant Nearby',
  'Security Doors',
  'Printing Service',
  'Fast Internet',
  'Big Compound',
  'Survey',
  'CCTV Cameras',
  'Jacuzzi',
];

// Simple Loading Overlay Component (only shows during navigation)
const NavigationLoader = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex items-center justify-center"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-100 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Searching Properties...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Taking you to the results
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const PropertySearchModal = ({ isOpen, onClose, onNavigate }) => {
  const [searchData, setSearchData] = useState({
    purpose: '',
    type: '',
    subType: '',
    state: '',
    lga: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    bathrooms: '',
    toilets: '',
    features: [],
    furnished: false,
    serviced: false,
    newlyBuilt: false,
    parking: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'type' && { subType: '' }), // Reset subType when type changes
    }));
  };

  const handleFeatureToggle = (feature) => {
    setSearchData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSearch = async () => {
    setIsNavigating(true);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Build query string matching your Prisma schema
      const queryParams = new URLSearchParams();

      // Map form data to your API parameters with correct enum values
      if (searchData.purpose) queryParams.set('purpose', searchData.purpose);
      if (searchData.type) queryParams.set('type', searchData.type);
      if (searchData.subType) queryParams.set('subType', searchData.subType);
      if (searchData.state) queryParams.set('state', searchData.state);
      if (searchData.lga) queryParams.set('lga', searchData.lga);
      if (searchData.minPrice) queryParams.set('minPrice', searchData.minPrice);
      if (searchData.maxPrice) queryParams.set('maxPrice', searchData.maxPrice);
      if (searchData.beds) queryParams.set('number_of_beds', searchData.beds);
      if (searchData.bathrooms)
        queryParams.set('number_of_bathrooms', searchData.bathrooms);
      if (searchData.toilets) queryParams.set('toilets', searchData.toilets);
      if (searchData.furnished) queryParams.set('furnished', 'true');
      if (searchData.serviced) queryParams.set('serviced', 'true');
      if (searchData.newlyBuilt) queryParams.set('newlyBuilt', 'true');
      if (searchData.parking) queryParams.set('parking', 'true');
      if (searchData.features.length > 0)
        queryParams.set('features', searchData.features.join(','));

      // Create the search URL
      const searchUrl = `/property?${queryParams.toString()}`;

      console.log('Navigating to:', searchUrl);

      // Close modal first
      onClose();

      // Use provided navigation function or fallback to React Router
      if (onNavigate) {
        onNavigate(searchUrl);
      }
    } catch (error) {
      console.error('Search navigation error:', error);
    } finally {
      // Small delay before hiding loader to ensure smooth transition
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const selectedState = locationData.find(
    (loc) => loc.state === searchData.state
  );
  const availableSubTypes = searchData.type
    ? propertySubTypes[searchData.type] || []
    : [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Find Your Perfect Property
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Search through thousands of properties
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  disabled={isNavigating}
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Search Form */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Home size={16} className="inline mr-1" />
                      Purpose
                    </label>
                    <select
                      value={searchData.purpose}
                      onChange={(e) =>
                        handleInputChange('purpose', e.target.value)
                      }
                      disabled={isNavigating}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select Purpose</option>
                      {purposes.map((purpose) => (
                        <option key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property Type
                    </label>
                    <select
                      value={searchData.type}
                      onChange={(e) =>
                        handleInputChange('type', e.target.value)
                      }
                      disabled={isNavigating}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select Type</option>
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Property Sub Type */}
                  {searchData.type && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub Type
                      </label>
                      <select
                        value={searchData.subType}
                        onChange={(e) =>
                          handleInputChange('subType', e.target.value)
                        }
                        disabled={isNavigating}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                      >
                        <option value="">Select Sub Type</option>
                        {availableSubTypes.map((subType) => (
                          <option key={subType.value} value={subType.value}>
                            {subType.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      State
                    </label>
                    <select
                      value={searchData.state}
                      onChange={(e) =>
                        handleInputChange('state', e.target.value)
                      }
                      disabled={isNavigating}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select State</option>
                      {locationData.map((location) => (
                        <option key={location.state} value={location.state}>
                          {location.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LGA */}
                  {selectedState && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Area (LGA)
                      </label>
                      <select
                        value={searchData.lga}
                        onChange={(e) =>
                          handleInputChange('lga', e.target.value)
                        }
                        disabled={isNavigating}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                      >
                        <option value="">Select Area</option>
                        {selectedState.lga.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Price Range
                    </label>
                    <select
                      onChange={(e) => {
                        const selected = priceRanges.find(
                          (range) => range.label === e.target.value
                        );
                        if (selected) {
                          handleInputChange('minPrice', selected.min);
                          handleInputChange('maxPrice', selected.max || '');
                        }
                      }}
                      disabled={isNavigating}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select Price Range</option>
                      {priceRanges.map((range) => (
                        <option key={range.label} value={range.label}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 disabled:opacity-50"
                  disabled={isNavigating}
                >
                  <Filter size={16} className="mr-2" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                </button>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Bedrooms */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Bed size={16} className="inline mr-1" />
                            Bedrooms
                          </label>
                          <select
                            value={searchData.beds}
                            onChange={(e) =>
                              handleInputChange('beds', e.target.value)
                            }
                            disabled={isNavigating}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                          >
                            <option value="">Any</option>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num}+ Bedroom{num > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Bathrooms */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Bath size={16} className="inline mr-1" />
                            Bathrooms
                          </label>
                          <select
                            value={searchData.bathrooms}
                            onChange={(e) =>
                              handleInputChange('bathrooms', e.target.value)
                            }
                            disabled={isNavigating}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                          >
                            <option value="">Any</option>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num}+ Bathroom{num > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Toilets */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Toilets
                          </label>
                          <select
                            value={searchData.toilets}
                            onChange={(e) =>
                              handleInputChange('toilets', e.target.value)
                            }
                            disabled={isNavigating}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                          >
                            <option value="">Any</option>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num}+ Toilet{num > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Property Features Checkboxes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={searchData.furnished}
                            onChange={(e) =>
                              handleInputChange('furnished', e.target.checked)
                            }
                            disabled={isNavigating}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Furnished
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={searchData.serviced}
                            onChange={(e) =>
                              handleInputChange('serviced', e.target.checked)
                            }
                            disabled={isNavigating}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Serviced
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={searchData.newlyBuilt}
                            onChange={(e) =>
                              handleInputChange('newlyBuilt', e.target.checked)
                            }
                            disabled={isNavigating}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Newly Built
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={searchData.parking}
                            onChange={(e) =>
                              handleInputChange('parking', e.target.checked)
                            }
                            disabled={isNavigating}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Parking
                          </span>
                        </label>
                      </div>

                      {/* Features */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Property Features
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                          {features.map((feature) => (
                            <label
                              key={feature}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={searchData.features.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                disabled={isNavigating}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    disabled={isNavigating}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={isNavigating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium disabled:opacity-50"
                  >
                    {isNavigating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Search Properties</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Loading Overlay */}
      <NavigationLoader isVisible={isNavigating} />
    </>
  );
};

const Hero = ({ onNavigate }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (searchUrl) => {
    if (onNavigate) {
      onNavigate(searchUrl);
    }
  };

  return (
    <>
      <div
        className="relative z-0 flex-wrap min-h-screen gap-2 md:-mt-10 flex-center-center"
        style={{
          background: "url('/images/hero-bg-pattern.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      >
        <div className="absolute top-0 right-0 rounded-full bg-[#04a7ff]/30 dark:bg-[#04a7ff]/50 w-72 h-72 -z-10 blur-[120px]"></div>

        <div className="flex-1 basis-[20rem]">
          <h1 className="text-4xl font-bold capitalize md:text-5xl">
            Unlock Your Dream Home
            <br /> Where Every Listing Tells a Story!
          </h1>
          <div className="pl-3 mt-5 border-l-4 border-primary">
            <p>
              Embark on a journey of endless possibilities with our diverse
              range of real estate offerings. Explore the realms of buying,
              renting, or short-term letting with ease, as your ideal property
              is just a click away. Elevate your living with us – where every
              space tells a unique story.
            </p>
          </div>

          {/* Animated Get Started Button */}
          <div className="mt-6 relative">
            <motion.button
              onClick={() => setIsSearchOpen(true)}
              className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Pulsing radiation rings */}
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  scale: [1, 1.2, 1.4, 1.6],
                  opacity: [0.7, 0.5, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  scale: [1, 1.3, 1.5, 1.7],
                  opacity: [0.5, 0.3, 0.1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  scale: [1, 1.4, 1.6, 1.8],
                  opacity: [0.3, 0.2, 0.1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                  ease: 'easeOut',
                }}
              />

              {/* Button content */}
              <span className="relative z-10 flex items-center space-x-2">
                <motion.span
                  animate={{
                    textShadow: [
                      '0 0 4px rgba(255,255,255,0.5)',
                      '0 0 8px rgba(255,255,255,0.8)',
                      '0 0 4px rgba(255,255,255,0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Get Started
                </motion.span>
                <motion.div
                  animate={{
                    x: [0, 4, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Search size={20} />
                </motion.div>
              </span>

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 basis-[20rem]">
          <img src="/images/hero-4.png" alt="" className="w-full" />
        </div>
      </div>

      {/* Property Search Modal */}
      <PropertySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default Hero;
