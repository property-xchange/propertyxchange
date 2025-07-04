import React from 'react';
import {
  FaLinkedin,
  FaSquareFacebook,
  FaSquareXTwitter,
} from 'react-icons/fa6';
import { FaInstagram } from 'react-icons/fa';

const SocialLinksStep = ({
  formData,
  handleSocialLinkChange,
  socialLinksErrors,
}) => {
  const socialPlatforms = [
    {
      name: 'facebook',
      label: 'Facebook',
      icon: FaSquareFacebook,
      placeholder: 'https://www.facebook.com/yourprofile',
      color: 'text-blue-600',
    },
    {
      name: 'instagram',
      label: 'Instagram',
      icon: FaInstagram,
      placeholder: 'https://www.instagram.com/yourprofile',
      color: 'text-pink-600',
    },
    {
      name: 'twitter',
      label: 'Twitter',
      icon: FaSquareXTwitter,
      placeholder: 'https://www.twitter.com/yourprofile',
      color: 'text-blue-400',
    },
    {
      name: 'linkedIn',
      label: 'LinkedIn',
      icon: FaLinkedin,
      placeholder: 'https://www.linkedin.com/in/yourprofile',
      color: 'text-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Social Media Links
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add your social media profiles (optional)
        </p>
      </div>

      <div className="space-y-4">
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <div key={platform.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <IconComponent
                  size={16}
                  className={`inline mr-2 ${platform.color}`}
                />
                {platform.label}
              </label>
              <input
                type="url"
                name={`${platform.name}Link`}
                value={formData[`${platform.name}Link`]}
                onChange={(e) =>
                  handleSocialLinkChange(platform.name, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={platform.placeholder}
              />
              {socialLinksErrors[platform.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {socialLinksErrors[platform.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinksStep;
