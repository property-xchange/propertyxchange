// Main Profile Component
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Building,
  MapPin,
  Share2,
  Camera,
} from 'lucide-react';
import { locationData } from '../data/dummyData.js';
import Dashboard from '../components/dashboard/Dashboard.jsx';
import { CiWarning } from 'react-icons/ci';
import { GrStatusGood } from 'react-icons/gr';
import toast from 'react-hot-toast';
import apiRequest from '../helper/apiRequest.js';
import { AuthContext } from '../context/AuthContext.jsx';

// Import step components
import BasicInfoStep from '../components/dashboard/steps/profile/BasicInfoStep.jsx';
import ContactInfoStep from '../components/dashboard/steps/profile/ContactInfoStep.jsx';
import AccountTypeStep from '../components/dashboard/steps/profile/AccountTypeStep.jsx';
import CompanyInfoStep from '../components/dashboard/steps/profile/CompanyInfoStep.jsx';
import LocationStep from '../components/dashboard/steps/profile/LocationStep.jsx';
import SocialLinksStep from '../components/dashboard/steps/profile/SocialLinksStep.jsx';
import ReviewStep from '../components/dashboard/steps/profile/ReviewStep.jsx';

// Import validation functions
import {
  validateFacebookLink,
  validateInstagramLink,
  validateLinkedInLink,
  validateTwitterLink,
} from '../helper/validate.js';

export default function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [profilePhoto, setProfilePhoto] = useState([]);
  const [companyPhoto, setCompanyPhoto] = useState([]);
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form data state
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phoneNumber: currentUser?.phoneNumber || '',
    whatsAppNum: currentUser?.whatsAppNum || '',
    companyName: currentUser?.companyName || '',
    companyEmail: currentUser?.companyEmail || '',
    companyNumber: currentUser?.companyNumber || '',
    address: currentUser?.address || '',
    aboutCompany: currentUser?.aboutCompany || '',
    services: currentUser?.services || '',
    facebookLink: currentUser?.facebookLink || '',
    instagramLink: currentUser?.instagramLink || '',
    twitterLink: currentUser?.twitterLink || '',
    linkedInLink: currentUser?.linkedInLink || '',
  });

  // State and LGA management
  const [selectedState, setSelectedState] = useState(currentUser?.state || '');
  const [selectedLGA, setSelectedLGA] = useState(currentUser?.lga || '');

  // Social links error states
  const [socialLinksErrors, setSocialLinksErrors] = useState({
    facebook: '',
    instagram: '',
    linkedIn: '',
    twitter: '',
  });

  useEffect(() => {
    if (currentUser && currentUser.accountType) {
      setAccountType(currentUser.accountType);
    }
  }, [currentUser]);

  const steps = [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Username & email',
      icon: User,
    },
    {
      id: 2,
      title: 'Contact Info',
      description: 'Name & phone numbers',
      icon: User,
    },
    {
      id: 3,
      title: 'Account Type',
      description: 'Choose your account type',
      icon: Building,
    },
    {
      id: 4,
      title: 'Company Info',
      description: 'Business details',
      icon: Building,
    },
    {
      id: 5,
      title: 'Location',
      description: 'State, LGA & address',
      icon: MapPin,
    },
    {
      id: 6,
      title: 'Social Links',
      description: 'Social media profiles',
      icon: Share2,
    },
    {
      id: 7,
      title: 'Review',
      description: 'Review & update',
      icon: Check,
    },
  ];

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (value) => {
    setAccountType(value);
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

  // Social link validation handlers
  const handleSocialLinkChange = (platform, value) => {
    handleInputChange({ target: { name: `${platform}Link`, value } });

    let isValid = true;
    let errorMessage = '';

    if (value) {
      switch (platform) {
        case 'facebook':
          isValid = validateFacebookLink(value);
          errorMessage = isValid ? '' : 'Invalid Facebook URL';
          break;
        case 'instagram':
          isValid = validateInstagramLink(value);
          errorMessage = isValid ? '' : 'Invalid Instagram URL';
          break;
        case 'linkedIn':
          isValid = validateLinkedInLink(value);
          errorMessage = isValid ? '' : 'Invalid LinkedIn URL';
          break;
        case 'twitter':
          isValid = validateTwitterLink(value);
          errorMessage = isValid ? '' : 'Invalid Twitter URL';
          break;
        default:
          break;
      }
    }

    setSocialLinksErrors((prev) => ({
      ...prev,
      [platform]: errorMessage,
    }));
  };

  // Validation functions
  const validateFirstName = (text) => {
    if (!text) {
      toast.error('First name is required');
      return false;
    }
    return true;
  };

  const validateLastName = (text) => {
    if (!text) {
      toast.error('Last name is required');
      return false;
    }
    return true;
  };

  const validateWhatsAppNumber = (number) => {
    if (!number) {
      toast.error('WhatsApp Number is required');
      return false;
    }
    return true;
  };

  const validateAddress = (text) => {
    if (!text) {
      toast.error('Address is required');
      return false;
    }
    return true;
  };

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.username && formData.email;
      case 2:
        return formData.firstName && formData.lastName && formData.whatsAppNum;
      case 3:
        return accountType;
      case 4:
        return true; // Company info is optional
      case 5:
        return selectedState && selectedLGA && formData.address;
      case 6:
        return !Object.values(socialLinksErrors).some((error) => error);
      case 7:
        return true;
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

    const isValidFirstName = validateFirstName(formData.firstName);
    if (!isValidFirstName) {
      setIsLoading(false);
      return;
    }

    const isValidLastName = validateLastName(formData.lastName);
    if (!isValidLastName) {
      setIsLoading(false);
      return;
    }

    const isValidWhatsAppNumber = validateWhatsAppNumber(formData.whatsAppNum);
    if (!isValidWhatsAppNumber) {
      setIsLoading(false);
      return;
    }

    if (!accountType) {
      toast.error('An account type is required');
      setIsLoading(false);
      return;
    }

    const isValidAddress = validateAddress(formData.address);
    if (!isValidAddress) {
      setIsLoading(false);
      return;
    }

    if (!selectedState) {
      toast.error('A state is required');
      setIsLoading(false);
      return;
    }

    if (!selectedLGA) {
      toast.error('A local government location is required');
      setIsLoading(false);
      return;
    }

    // Check for social media link errors
    const hasErrors = Object.values(socialLinksErrors).some((error) => error);
    if (hasErrors) {
      toast.error('Please fix the errors in social media links');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        accountType,
        state: selectedState,
        lga: selectedLGA,
        profilePhoto: profilePhoto[0],
        companyPhoto: companyPhoto[0],
      };

      const res = await apiRequest.put(`/user/${currentUser.id}`, payload);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const userLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderStepContent = () => {
    const stepProps = {
      formData,
      handleInputChange,
      accountType,
      handleCheckboxChange,
      selectedState,
      selectedLGA,
      handleStateChange,
      handleLGAChange,
      locationData,
      socialLinksErrors,
      handleSocialLinkChange,
      profilePhoto,
      setProfilePhoto,
      companyPhoto,
      setCompanyPhoto,
      currentUser,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <ContactInfoStep {...stepProps} />;
      case 3:
        return <AccountTypeStep {...stepProps} />;
      case 4:
        return <CompanyInfoStep {...stepProps} />;
      case 5:
        return <LocationStep {...stepProps} />;
      case 6:
        return <SocialLinksStep {...stepProps} />;
      case 7:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <Dashboard>
      <main className="p-3 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your profile information step by step
          </p>
        </div>

        {/* Verification Status */}
        <div
          className={`${
            !currentUser.verified ? 'bg-red-400' : 'bg-green-400'
          } text-white p-4 text-center rounded-md mt-3 mb-6 flex-col justify-center items-center gap-3`}
        >
          <div className="flex justify-center items-center gap-2">
            {!currentUser.verified ? (
              <CiWarning className="text-3xl" />
            ) : (
              <GrStatusGood className="text-3xl" />
            )}
            <h1 className="sm:text-lg text-sm font-semibold">
              {!currentUser.verified
                ? 'Account not verified!'
                : 'Congratulations your account is verified!'}
            </h1>
          </div>
          {!currentUser.verified && (
            <div className="flex justify-center items-center gap-2 mt-2">
              <h2 className="sm:text-sm text-xs">
                Verify your account to get our verification badge on your
                profile.
              </h2>
              <Link className="underline text-sm" to="/verify">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
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
                        <IconComponent size={16} />
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
              );
            })}
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Update Profile</span>
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

        {/* Logout Button */}
        <div className="flex justify-center mt-6">
          <span className="text-gray-500">
            Come back later?{' '}
            <button
              onClick={userLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </span>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep} of {totalSteps} completed
        </div>
      </main>
    </Dashboard>
  );
}
