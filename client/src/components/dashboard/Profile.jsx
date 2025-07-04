
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { locationData } from '../../data/dummyData.js';
import Dashboard from './Dashboard.jsx';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Upload, User, Building, MapPin, FileText, Shield } from 'lucide-react';
import { FaLinkedin, FaWhatsappSquare, FaSquareFacebook, FaSquareXTwitter } from 'react-icons/fa6';
import { AiFillInstagram } from 'react-icons/ai';
import { TbDeviceLandlinePhone } from 'react-icons/tb';
import { FaRegUser, FaRegBuilding, FaRegEnvelope } from 'react-icons/fa6';
import { GrStatusGood } from 'react-icons/gr';
import { CiWarning } from 'react-icons/ci';
import companyLogo from '../../assets/company_logo.png';
import defaultUserImg from '../../assets/avatar.webp';
import toast, { Toaster } from 'react-hot-toast';
import apiRequest from '../../helper/apiRequest.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import UploadWidget from '../common/page-components/UploadWidget.jsx';

export default function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [profilePhoto, setProfilePhoto] = useState([]);
  const [companyPhoto, setCompanyPhoto] = useState([]);
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Document upload states
  const [documents, setDocuments] = useState({
    companyRegDocument: null,
    businessLicense: null,
    taxCertificate: null,
  });

  // Profile completion tracking
  const [profileCompletion, setProfileCompletion] = useState({
    basicInfo: false,
    contactInfo: false,
    locationInfo: false,
    businessInfo: false,
    socialLinks: false,
    documents: false,
  });

  useEffect(() => {
    if (currentUser && currentUser.accountType) {
      setAccountType(currentUser.accountType);
      checkProfileCompletion();
    }
  }, [currentUser]);

  // Check if profile is complete
  const checkProfileCompletion = () => {
    const basicInfo = !!(currentUser.firstName && currentUser.lastName && currentUser.username);
    const contactInfo = !!(currentUser.phoneNumber && currentUser.whatsAppNum);
    const locationInfo = !!(currentUser.state && currentUser.lga && currentUser.address);
    const businessInfo = accountType === 'individual' ? true : !!(currentUser.companyName);
    const socialLinks = true; // Optional
    const documents = accountType === 'individual' ? true : !!(currentUser.companyRegDocument);

    setProfileCompletion({
      basicInfo,
      contactInfo,
      locationInfo,
      businessInfo,
      socialLinks,
      documents,
    });

    // If profile is not complete, enable step mode
    const isComplete = basicInfo && contactInfo && locationInfo && businessInfo && documents;
    if (!isComplete && !currentUser.profileCompleted) {
      setIsStepMode(true);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Name, username, and account type',
      icon: User,
      fields: ['firstName', 'lastName', 'username', 'accountType'],
      completed: profileCompletion.basicInfo && !!accountType,
    },
    {
      id: 2,
      title: 'Contact Information',
      description: 'Phone and WhatsApp numbers',
      icon: TbDeviceLandlinePhone,
      fields: ['phoneNumber', 'whatsAppNum'],
      completed: profileCompletion.contactInfo,
    },
    {
      id: 3,
      title: 'Location Details',
      description: 'State, LGA, and address',
      icon: MapPin,
      fields: ['state', 'lga', 'address'],
      completed: profileCompletion.locationInfo,
    },
    {
      id: 4,
      title: 'Business Information',
      description: 'Company details and services',
      icon: Building,
      fields: accountType !== 'individual' ? ['companyName', 'aboutCompany'] : [],
      completed: profileCompletion.businessInfo,
    },
    {
      id: 5,
      title: 'Documents Upload',
      description: 'Registration documents (if applicable)',
      icon: FileText,
      fields: accountType !== 'individual' ? ['companyRegDocument'] : [],
      completed: profileCompletion.documents,
      show: accountType !== 'individual',
    },
    {
      id: 6,
      title: 'Social Links',
      description: 'Optional social media links',
      icon: Shield,
      fields: ['facebookLink', 'instagramLink'],
      completed: true, // Optional step
      optional: true,
    },
  ];

  const visibleSteps = steps.filter(step => step.show !== false);
  const totalSteps = visibleSteps.length;
  const completedSteps = visibleSteps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // State management for form
  const [selectedState, setSelectedState] = useState(currentUser?.state || '');
  const [selectedLGA, setSelectedLGA] = useState(currentUser?.lga || '');

  // Social links error states
  const [facebookLinkErr, setFacebookLinkErr] = useState('');
  const [instagramLinkErr, setInstagramLinkErr] = useState('');
  const [linkedInLinkErr, setLinkedInLinkErr] = useState('');
  const [twitterLinkErr, setTwitterLinkErr] = useState('');

  // Validation functions
  const validateStep = (stepId) => {
    const step = visibleSteps.find(s => s.id === stepId);
    if (!step || step.optional) return true;
    return step.completed;
  };

  const validateForm = () => {
    const requiredFields = {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      phoneNumber: 'Phone number is required',
      whatsAppNum: 'WhatsApp number is required',
      address: 'Address is required',
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!currentUser[field]) {
        toast.error(message);
        return false;
      }
    }

    if (!accountType) {
      toast.error('Account type is required');
      return false;
    }

    if (!selectedState) {
      toast.error('State is required');
      return false;
    }

    if (!selectedLGA) {
      toast.error('LGA is required');
      return false;
    }

    // Business account validations
    if (accountType !== 'individual') {
      if (!currentUser.companyName) {
        toast.error('Company name is required for business accounts');
        return false;
      }
      if (!currentUser.companyRegDocument && !documents.companyRegDocument) {
        toast.error('Company registration document is required');
        return false;
      }
    }

    return true;
  };

  // File upload handler
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      // Validate file size (5MB max)
      if (files[0].size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(files[0].type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }

      setDocuments(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  // Upload document to cloud
  const uploadDocument = async (file, fieldName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Using your existing Cloudinary setup
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/propertyxchange/auto/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(e.target);
      let updatedData = {};

      // Extract form data
      for (const [key, value] of formData.entries()) {
        updatedData[key] = value;
      }

      // Add additional data
      updatedData.accountType = accountType;
      updatedData.state = selectedState;
      updatedData.lga = selectedLGA;
      updatedData.profilePhoto = profilePhoto[0] || currentUser.profilePhoto;
      updatedData.companyPhoto = companyPhoto[0] || currentUser.companyPhoto;

      // Upload documents if they exist
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          toast.info(`Uploading ${key}...`);
          const url = await uploadDocument(file, key);
          updatedData[key] = url;
        }
      }

      // Mark profile as completed if all steps are done
      const allStepsCompleted = visibleSteps.every(step => step.completed || step.optional);
      if (allStepsCompleted) {
        updatedData.profileCompleted = true;
      }

      const response = await apiRequest.put(`/user/${currentUser.id}`, updatedData);
      updateUser(response.data);
      
      toast.success('Profile updated successfully!');
      
      // If profile is now complete, disable step mode
      if (allStepsCompleted) {
        setIsStepMode(false);
        toast.success('🎉 Profile completed! You can now create listings.');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle checkbox change for account type
  const handleCheckboxChange = (value) => {
    setAccountType(value);
  };

  // State and LGA handlers
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
  const validateFacebookLink = (url) => {
    const facebookRegex = /^https?:\/\/(www\.)?facebook\.com\/.+/;
    return facebookRegex.test(url);
  };

  const validateInstagramLink = (url) => {
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/.+/;
    return instagramRegex.test(url);
  };

  const handleFbkChange = (e) => {
    const input = e.target.value;
    if (input && !validateFacebookLink(input)) {
      setFacebookLinkErr('Invalid Facebook URL');
    } else {
      setFacebookLinkErr('');
    }
  };

  const handleInstagramChange = (e) => {
    const input = e.target.value;
    if (input && !validateInstagramLink(input)) {
      setInstagramLinkErr('Invalid Instagram URL');
    } else {
      setInstagramLinkErr('');
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    if (!isStepMode) return null;

    return (
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Completion
            </h3>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {completedSteps}/{totalSteps} steps completed ({progressPercentage}%)
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    step.completed
                      ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                      : currentStep === step.id
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-full mr-3 ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                    }`}>
                      {step.completed ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        step.completed || currentStep === step.id
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {step.title}
                        {step.optional && (
                          <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render profile completion warning
  const renderCompletionWarning = () => {
    if (currentUser.profileCompleted && currentUser.verified) return null;

    return (
      <div className="mb-6">
        {!currentUser.profileCompleted && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" size={20} />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You need to complete your profile before you can create property listings. 
                  Please fill in all required information and upload necessary documents.
                </p>
                <button
                  onClick={() => setIsStepMode(true)}
                  className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                >
                  Start Step-by-Step Completion
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`${
          !currentUser.verified ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        } border rounded-lg p-4`}>
          <div className="flex items-center">
            {!currentUser.verified ? (
              <CiWarning className="text-red-600 dark:text-red-400 mr-3" size={24} />
            ) : (
              <GrStatusGood className="text-green-600 dark:text-green-400 mr-3" size={24} />
            )}
            <div>
              <h3 className={`font-semibold ${
                !currentUser.verified 
                  ? 'text-red-800 dark:text-red-200' 
                  : 'text-green-800 dark:text-green-200'
              }`}>
                {!currentUser.verified
                  ? 'Account Verification Pending'
                  : 'Account Verified! 🎉'}
              </h3>
              <p className={`text-sm mt-1 ${
                !currentUser.verified 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {!currentUser.verified
                  ? 'Your account is pending verification by our admin team. You can create listings once verified.'
                  : 'Your account has been verified! You can now create property listings.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dashboard>
      <main className="p-3 max-w-6xl mx-auto">
        <Toaster position="top-center" reverseOrder={false} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your profile to start creating property listings
          </p>
        </div>

        {renderCompletionWarning()}
        {renderStepIndicator()}

        <form
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Photo and Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="mr-2" size={20} />
                  Basic Information
                  {profileCompletion.basicInfo && <Check className="ml-2 text-green-500" size={16} />}
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={profilePhoto[0] || currentUser.profilePhoto || defaultUserImg}
                      alt="profile"
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                    />
                    <UploadWidget
                      uwConfig={{
                        cloudName: 'propertyxchange',
                        uploadPreset: 'estate',
                        multiple: false,
                        maxImageFileSize: 2000000,
                        folder: 'avatars',
                      }}
                      setState={setProfilePhoto}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">
                      Upload profile picture
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="Username *"
                      name="username"
                      defaultValue={currentUser.username}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      name="email"
                      defaultValue={currentUser.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Last Name *"
                    name="lastName"
                    defaultValue={currentUser.lastName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="First Name *"
                    name="firstName"
                    defaultValue={currentUser.firstName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Account Type Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Account Type *</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'individual', label: 'Individual Agent' },
                    { value: 'company', label: 'Company' },
                    { value: 'developer', label: 'Developer' },
                    { value: 'law', label: 'Law Firm' },
                    { value: 'survey', label: 'Estate Surveying Firm' },
                    { value: 'organization', label: 'Real Estate Organization' },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="url"
                        placeholder="https://www.linkedin.com/company/yourcompany"
                        name="linkedInLink"
                        defaultValue={currentUser.linkedInLink}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <FaSquareXTwitter className="text-gray-800 dark:text-white" size={20} />
                      <input
                        type="url"
                        placeholder="https://www.twitter.com/yourcompany"
                        name="twitterLink"
                        defaultValue={currentUser.twitterLink}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Profile Completion:</span> {progressPercentage}%
                {!currentUser.profileCompleted && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    (Complete profile to create listings)
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsStepMode(!isStepMode)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {isStepMode ? 'Exit Step Mode' : 'Step-by-Step Mode'}
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </Dashboard>
  );
}

