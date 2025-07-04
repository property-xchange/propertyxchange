import React from 'react';
import { User, Building, MapPin, Share2, CheckCircle } from 'lucide-react';

const ReviewStep = ({
  formData,
  accountType,
  selectedState,
  selectedLGA,
  profilePhoto,
  companyPhoto,
  currentUser,
}) => {
  const reviewSections = [
    {
      title: 'Basic Information',
      icon: User,
      items: [
        { label: 'Username', value: formData.username },
        { label: 'Email', value: formData.email },
        { label: 'First Name', value: formData.firstName },
        { label: 'Last Name', value: formData.lastName },
      ],
    },
    {
      title: 'Contact Information',
      icon: User,
      items: [
        { label: 'Phone Number', value: formData.phoneNumber },
        { label: 'WhatsApp Number', value: formData.whatsAppNum },
      ],
    },
    {
      title: 'Account Type',
      icon: Building,
      items: [
        {
          label: 'Account Type',
          value: accountType?.charAt(0).toUpperCase() + accountType?.slice(1),
        },
      ],
    },
    {
      title: 'Company Information',
      icon: Building,
      items: [
        { label: 'Company Name', value: formData.companyName },
        { label: 'Company Email', value: formData.companyEmail },
        { label: 'Company Number', value: formData.companyNumber },
        { label: 'About Company', value: formData.aboutCompany },
        { label: 'Services', value: formData.services },
      ],
    },
    {
      title: 'Location',
      icon: MapPin,
      items: [
        { label: 'State', value: selectedState },
        { label: 'LGA', value: selectedLGA },
        { label: 'Address', value: formData.address },
      ],
    },
    {
      title: 'Social Media',
      icon: Share2,
      items: [
        { label: 'Facebook', value: formData.facebookLink },
        { label: 'Instagram', value: formData.instagramLink },
        { label: 'Twitter', value: formData.twitterLink },
        { label: 'LinkedIn', value: formData.linkedInLink },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Review Your Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please review all the information before updating your profile
        </p>
      </div>

      <div className="space-y-6">
        {reviewSections.map((section, index) => {
          const IconComponent = section.icon;
          const hasContent = section.items.some((item) => item.value);

          if (!hasContent) return null;

          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-3">
                <IconComponent size={20} className="mr-2 text-blue-600" />
                {section.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map(
                  (item, itemIndex) =>
                    item.value && (
                      <div key={itemIndex} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {item.label}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle
            size={20}
            className="text-green-600 dark:text-green-400 mr-2"
          />
          <p className="text-green-800 dark:text-green-200 text-sm">
            Your profile information is ready to be updated. Click "Update
            Profile" to save your changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
