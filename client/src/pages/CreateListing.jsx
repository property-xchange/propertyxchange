import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  useNavigate,
  useLoaderData,
  useParams,
  useLocation,
} from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";
import Dashboard from "../components/dashboard/Dashboard.jsx";
import toast from "react-hot-toast";
import apiRequest from "../helper/apiRequest.js";

// Import separate step components
import BasicInfoStep from "../components/dashboard/steps/create-listings/BasicInfoStep.jsx";
import FeaturesStep from "../components/dashboard/steps/create-listings/FeaturesStep.jsx";
import LocationStep from "../components/dashboard/steps/create-listings/LocationStep.jsx";
import PricingStep from "../components/dashboard/steps/create-listings/PricingStep.jsx";
import MediaStep from "../components/dashboard/steps/create-listings/MediaStep.jsx";
import ReviewStep from "../components/dashboard/steps/create-listings/ReviewStep.jsx";

// Import data and helpers
import {
  locationData,
  listingType,
  listingFeatures,
} from "../data/dummyData.js";
import {
  validateYouTubeLink,
  validateInstagramLink,
} from "../helper/validate.js";
import { getCurrentLocation } from "../helper/locationHelper.js";

export default function CreateListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();

  // Determine if this is edit mode
  const isEdit = location.pathname.includes("/edit-listing/");

  // ALWAYS call useLoaderData unconditionally at the top level
  const loaderData = useLoaderData();

  // Then conditionally use the data
  const existingListing = isEdit ? loaderData : null;

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // State variables for form validation and UI
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [instagramLinkErr, setInstagramLinkErr] = useState("");
  const [youTubeLinkErr, setYouTubeLinkErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Form data state
  const [formData, setFormData] = useState(() => {
    if (isEdit && existingListing) {
      return {
        name: existingListing.name || "",
        street: existingListing.street || "",
        latitude: existingListing.latitude || "",
        longitude: existingListing.longitude || "",
        price: existingListing.price?.toString() || "",
        number_of_beds: existingListing.number_of_beds?.toString() || "",
        number_of_bathrooms:
          existingListing.number_of_bathrooms?.toString() || "",
        toilets: existingListing.toilets?.toString() || "",
        appendTo: existingListing.appendTo || "",
        initialPayment: existingListing.initialPayment?.toString() || "",
        monthlyPayment: existingListing.monthlyPayment?.toString() || "",
        duration: existingListing.duration?.toString() || "",
        installmentAppendTo: existingListing.installmentAppendTo || "",
        discountEndDate: existingListing.discountEndDate
          ? new Date(existingListing.discountEndDate)
              .toISOString()
              .split("T")[0]
          : "",
        youtubeLink: existingListing.youtubeLink || "",
        instagramLink: existingListing.instagramLink || "",
      };
    }
    return {
      name: "",
      street: "",
      latitude: "",
      longitude: "",
      price: "",
      number_of_beds: "",
      number_of_bathrooms: "",
      toilets: "",
      appendTo: "",
      initialPayment: "",
      monthlyPayment: "",
      duration: "",
      installmentAppendTo: "",
      discountEndDate: "",
      youtubeLink: "",
      instagramLink: "",
    };
  });

  // Rest of your code remains the same...
  // Initialize other state with existing data if editing
  const [images, setImages] = useState(
    isEdit && existingListing?.images ? existingListing.images : [],
  );
  const [purpose, setPurpose] = useState(
    isEdit && existingListing?.purpose
      ? existingListing.purpose.toLowerCase()
      : "",
  );
  const [selectedType, setSelectedType] = useState(
    isEdit && existingListing?.type ? existingListing.type : "",
  );
  const [selectedSubType, setSelectedSubType] = useState(
    isEdit && existingListing?.subType ? existingListing.subType : "",
  );
  const [description, setDescription] = useState(
    isEdit && existingListing?.description ? existingListing.description : "",
  );
  const [selectedFeatures, setSelectedFeatures] = useState(
    isEdit && existingListing?.features ? existingListing.features : [],
  );
  const [selectedState, setSelectedState] = useState(
    isEdit && existingListing?.state ? existingListing.state : "",
  );
  const [selectedLGA, setSelectedLGA] = useState(
    isEdit && existingListing?.lga ? existingListing.lga : "",
  );
  const [showDiscount, setShowDiscount] = useState(
    isEdit && existingListing?.offer ? existingListing.offer : false,
  );
  const [showInstallment, setShowInstallment] = useState(
    isEdit && existingListing?.installment
      ? existingListing.installment
      : false,
  );
  const [regularPrice, setRegularPrice] = useState(
    isEdit && existingListing?.price ? existingListing.price.toString() : "",
  );
  const [discountPrice, setDiscountPrice] = useState(
    isEdit && existingListing?.discountPrice
      ? existingListing.discountPrice.toString()
      : "",
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    isEdit && existingListing?.discountPercent
      ? existingListing.discountPercent.toString()
      : "",
  );
  const [isServiced, setIsServiced] = useState(
    isEdit && existingListing?.serviced ? existingListing.serviced : false,
  );
  const [isFurnished, setIsFurnished] = useState(
    isEdit && existingListing?.furnished ? existingListing.furnished : false,
  );
  const [hasParking, setHasParking] = useState(
    isEdit && existingListing?.parking ? existingListing.parking : false,
  );
  const [isNewlyBuilt, setIsNewlyBuilt] = useState(
    isEdit && existingListing?.newlyBuilt ? existingListing.newlyBuilt : false,
  );

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Property name, type & purpose",
    },
    { id: 2, title: "Features", description: "Beds, baths & amenities" },
    { id: 3, title: "Location", description: "Address & coordinates" },
    { id: 4, title: "Pricing", description: "Price & payment options" },
    { id: 5, title: "Media", description: "Images & social links" },
    { id: 6, title: "Review", description: "Final review & submit" },
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
      toast.success("Location retrieved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const toggleDiscount = () => setShowDiscount(!showDiscount);
  const toggleInstallment = () => setShowInstallment(!showInstallment);

  const handleCheckboxChange = (value) => {
    setPurpose(value);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setSelectedSubType("");
  };

  const handleSubTypeChange = (e) => {
    const subType = e.target.value;
    setSelectedSubType(subType);
  };

  const handleBooleanChange = (booleans) => {
    switch (booleans) {
      case "serviced":
        setIsServiced(!isServiced);
        break;
      case "furnished":
        setIsFurnished(!isFurnished);
        break;
      case "parking":
        setHasParking(!hasParking);
        break;
      case "newlyBuilt":
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
    setSelectedLGA("");
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
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleInstagramChange = (e) => {
    const input = e.target.value;
    handleInputChange(e);
    const isValidInstagramLink = validateInstagramLink(input);
    if (input && !isValidInstagramLink) {
      setInstagramLinkErr("Invalid Instagram URL");
    } else {
      setInstagramLinkErr("");
    }
  };

  const handleYouTubeChange = (e) => {
    const input = e.target.value;
    handleInputChange(e);
    const isValidYouTubeLink = validateYouTubeLink(input);
    if (input && !isValidYouTubeLink) {
      setYouTubeLinkErr("Invalid YouTube URL");
    } else {
      setYouTubeLinkErr("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        purpose: purpose,
        number_of_beds: parseInt(formData.number_of_beds),
        number_of_bathrooms: parseInt(formData.number_of_bathrooms),
        toilets: parseInt(formData.toilets),
        latitude: formData.latitude,
        longitude: formData.longitude,
        discountPercent: parseFloat(discountPercentage) || null,
        discountPrice: parseFloat(discountPrice) || null,
        discountEndDate: formData.discountEndDate
          ? new Date(formData.discountEndDate + "T00:00:00Z").toISOString()
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
        type: selectedType,
        subType: selectedSubType || null,
        features: selectedFeatures,
        street: formData.street,
        lga: selectedLGA,
        state: selectedState,
        description: description,
        images: images,
      };

      console.log("Payload being sent:", payload);

      let res;
      if (isEdit) {
        res = await apiRequest.put(`/listing/${params.id}`, payload);
        toast.success("Listing updated successfully!");
      } else {
        res = await apiRequest.post("/listing", payload);
        toast.success("Listing created successfully!");
      }

      navigate("/property/" + (res.data.slug || res.data.id));
    } catch (err) {
      console.error(`Error ${isEdit ? "updating" : "creating"} listing:`, err);
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} listing`,
      );
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
            {isEdit ? "Edit Property Listing" : "Create Property Listing"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit
              ? "Update your property information"
              : "Follow the steps below to list your property"}
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
                        ? "bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600"
                        : currentStep === step.id
                          ? "bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600"
                          : "bg-white border-gray-300 text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500"
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
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs ${
                        currentStep >= step.id
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-400 dark:text-gray-500"
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
                        ? "bg-green-500 dark:bg-green-600"
                        : "bg-gray-300 dark:bg-gray-600"
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
                  ? "text-gray-400 cursor-not-allowed dark:text-gray-500"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
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
                      ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isEdit ? "Updating..." : "Publishing..."}</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>
                        {isEdit ? "Update Listing" : "Publish Listing"}
                      </span>
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
