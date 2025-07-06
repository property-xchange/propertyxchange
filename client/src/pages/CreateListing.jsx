import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';
import Dashboard from '../components/dashboard/Dashboard.jsx';
import toast from 'react-hot-toast';
import apiRequest from '../helper/apiRequest.js';

// Import separate step components
import BasicInfoStep from '../components/dashboard/steps/create-listings/BasicInfoStep.jsx';
import FeaturesStep from '../components/dashboard/steps/create-listings/FeaturesStep.jsx';
import LocationStep from '../components/dashboard/steps/create-listings/LocationStep.jsx';
import PricingStep from '../components/dashboard/steps/create-listings/PricingStep.jsx';
import MediaStep from '../components/dashboard/steps/create-listings/MediaStep.jsx';
import ReviewStep from '../components/dashboard/steps/create-listings/ReviewStep.jsx';

// Import data and helpers
import {
  locationData,
  listingType,
  listingFeatures,
} from '../data/dummyData.js';
import {
  validateYouTubeLink,
  validateInstagramLink,
} from '../helper/validate.js';
import { getCurrentLocation } from '../helper/locationHelper.js';

export default function CreateListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    latitude: '',
    longitude: '',
    price: '',
    number_of_beds: '',
    number_of_bathrooms: '',
    toilets: '',
    appendTo: '',
    initialPayment: '',
    monthlyPayment: '',
    duration: '',
    installmentAppendTo: '',
    discountEndDate: '',
    youtubeLink: '',
    instagramLink: '',
  });

  // All other state variables
  const [images, setImages] = useState([]);
  const [purpose, setPurpose] = useState();
  const [selectedType, setSelectedType] = useState();
  const [selectedSubType, setSelectedSubType] = useState();
  const [description, setDescription] = useState('');
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedState, setSelectedState] = useState();
  const [selectedLGA, setSelectedLGA] = useState();
  const [showDiscount, setShowDiscount] = useState(false);
  const [showInstallment, setShowInstallment] = useState(false);
  const [regularPrice, setRegularPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [instagramLinkErr, setInstagramLinkErr] = useState();
  const [youTubeLinkErr, setYouTubeLinkErr] = useState();
  const [isServiced, setIsServiced] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [isNewlyBuilt, setIsNewlyBuilt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Property name, type & purpose',
    },
    { id: 2, title: 'Features', description: 'Beds, baths & amenities' },
    { id: 3, title: 'Location', description: 'Address & coordinates' },
    { id: 4, title: 'Pricing', description: 'Price & payment options' },
    { id: 5, title: 'Media', description: 'Images & social links' },
    { id: 6, title: 'Review', description: 'Final review & submit' },
  ];

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      }));
      toast.success('Location retrieved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // All your existing handler functions...
  const toggleDiscount = () => setShowDiscount(!showDiscount);
  const toggleInstallment = () => setShowInstallment(!showInstallment);

  const handleCheckboxChange = (value) => {
    setPurpose(value);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setSelectedSubType('');
  };

  const handleSubTypeChange = (e) => {
    const subType = e.target.value;
    setSelectedSubType(subType);
  };

  const handleBooleanChange = (booleans) => {
    switch (booleans) {
      case 'serviced':
        setIsServiced(!isServiced);
        break;
      case 'furnished':
        setIsFurnished(!isFurnished);
        break;
      case 'parking':
        setHasParking(!hasParking);
        break;
      case 'newlyBuilt':
        setIsNewlyBuilt(!isNewlyBuilt);
        break;
      default:
        break;
    }
  };

  const moreFeatures = () => {
    setShowMoreFeatures(!showMoreFeatures);
  };

  const handleFeatureChange = (feature) => {
    setSelectedFeatures((prevFeatures) => {
      if (prevFeatures.includes(feature)) {
        return prevFeatures.filter((f) => f !== feature);
      } else {
        return [...prevFeatures, feature];
      }
    });
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedLGA('');
  };

  const handleLGAChange = (e) => {
    const newLGA = e.target.value;
    setSelectedLGA(newLGA);
  };

  const handleDiscountPercentageChange = (e) => {
    const value = e.target.value;
    setDiscountPercentage(value);
    const discountAmount = (value / 100) * regularPrice;
    if (regularPrice) {
      setDiscountPrice((regularPrice - discountAmount).toFixed(2));
    }
  };

  const handleDiscountPriceChange = (e) => {
    const value = e.target.value;
    const discountPercentage = (value / regularPrice) * 100;
    setDiscountPrice(value);
    if (regularPrice) {
      setDiscountPercentage((100 - discountPercentage).toFixed(2));
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleInstagramChange = (e) => {
    const input = e.target.value;
    handleInputChange(e);
    const isValidInstagramLink = validateInstagramLink(input);
    if (input && !isValidInstagramLink) {
      setInstagramLinkErr('Invalid Instagram URL');
    } else {
      setInstagramLinkErr('');
    }
  };

  const handleYouTubeChange = (e) => {
    const input = e.target.value;
    handleInputChange(e);
    const isValidYouTubeLink = validateYouTubeLink(input);
    if (input && !isValidYouTubeLink) {
      setYouTubeLinkErr('Invalid YouTube URL');
    } else {
      setYouTubeLinkErr('');
    }
  };

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && selectedType && purpose;
      case 2:
        return (
          formData.number_of_beds &&
          formData.number_of_bathrooms &&
          formData.toilets
        );
      case 3:
        return (
          selectedState &&
          selectedLGA &&
          formData.street &&
          formData.latitude &&
          formData.longitude
        );
      case 4:
        return formData.price;
      case 5:
        return images.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const payload = {
  //       name: formData.name,
  //       price: parseFloat(formData.price),
  //       purpose,
  //       number_of_beds: parseInt(formData.number_of_beds),
  //       number_of_bathrooms: parseInt(formData.number_of_bathrooms),
  //       toilets: parseInt(formData.toilets),
  //       latitude: formData.latitude,
  //       longitude: formData.longitude,
  //       discountPercent: parseFloat(discountPercentage),
  //       discountPrice: parseFloat(discountPrice),
  //       discountEndDate: formData.discountEndDate
  //         ? new Date(formData.discountEndDate + 'T00:00:00Z').toISOString()
  //         : null,
  //       installment: showInstallment,
  //       appendTo: formData.appendTo,
  //       installmentAppendTo: formData.installmentAppendTo,
  //       initialPayment: parseFloat(formData.initialPayment),
  //       monthlyPayment: parseFloat(formData.monthlyPayment),
  //       duration: parseInt(formData.duration),
  //       furnished: isFurnished,
  //       serviced: isServiced,
  //       newlyBuilt: isNewlyBuilt,
  //       parking: hasParking,
  //       offer: showDiscount,
  //       youtubeLink: formData.youtubeLink,
  //       instagramLink: formData.instagramLink,
  //       type: selectedType,
  //       subType: selectedSubType,
  //       features: selectedFeatures,
  //       street: formData.street,
  //       lga: selectedLGA,
  //       state: selectedState,
  //       description: description,
  //       images: images,
  //     };

  //     const res = await apiRequest.post('/listing', payload);
  //     toast.success('Listing created successfully!');
  //     navigate('/property/' + res.data.id);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed to create listing');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        purpose: purpose, // This should be lowercase as backend will handle conversion
        number_of_beds: parseInt(formData.number_of_beds),
        number_of_bathrooms: parseInt(formData.number_of_bathrooms),
        toilets: parseInt(formData.toilets),
        latitude: formData.latitude,
        longitude: formData.longitude,
        discountPercent: parseFloat(discountPercentage) || null,
        discountPrice: parseFloat(discountPrice) || null,
        discountEndDate: formData.discountEndDate
          ? new Date(formData.discountEndDate + 'T00:00:00Z').toISOString()
          : null,
        installment: showInstallment,
        appendTo: formData.appendTo || null,
        installmentAppendTo: formData.installmentAppendTo || null,
        initialPayment: parseFloat(formData.initialPayment) || null,
        monthlyPayment: parseFloat(formData.monthlyPayment) || null,
        duration: parseInt(formData.duration) || null,
        furnished: isFurnished,
        serviced: isServiced,
        newlyBuilt: isNewlyBuilt,
        parking: hasParking,
        offer: showDiscount,
        youtubeLink: formData.youtubeLink || null,
        instagramLink: formData.instagramLink || null,
        type: selectedType, // This should be the display format as backend will handle conversion
        subType: selectedSubType || null, // This should be the display format as backend will handle conversion
        features: selectedFeatures,
        street: formData.street,
        lga: selectedLGA,
        state: selectedState,
        description: description,
        images: images,
      };

      console.log('Payload being sent:', payload);

      const res = await apiRequest.post('/listing', payload);
      toast.success('Listing created successfully!');
      navigate('/property/' + res.data.slug);
    } catch (err) {
      console.error('Error creating listing:', err);
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const stepProps = {
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
      selectedState,
      selectedLGA,
      handleStateChange,
      handleLGAChange,
      locationData,
      handleGetCurrentLocation,
      isGettingLocation,
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
      images,
      setImages,
      handleInstagramChange,
      handleYouTubeChange,
      instagramLinkErr,
      youTubeLinkErr,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <FeaturesStep {...stepProps} />;
      case 3:
        return <LocationStep {...stepProps} />;
      case 4:
        return <PricingStep {...stepProps} />;
      case 5:
        return <MediaStep {...stepProps} />;
      case 6:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Property Listing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Follow the steps below to list your property
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep > step.id
                        ? 'bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600'
                        : currentStep === step.id
                        ? 'bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600'
                        : 'bg-white border-gray-300 text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs ${
                        currentStep >= step.id
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id
                        ? 'bg-green-500 dark:bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !validateStep(currentStep)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
                    !isLoading && validateStep(currentStep)
                      ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Publish Listing</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Step Validation Messages */}
          {!validateStep(currentStep) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900 dark:border-yellow-700">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Please fill in all required fields before proceeding to the next
                step.
              </p>
            </div>
          )}
        </form>

        {/* Progress Summary */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep} of {totalSteps} completed
        </div>
      </div>
    </Dashboard>
  );
}
