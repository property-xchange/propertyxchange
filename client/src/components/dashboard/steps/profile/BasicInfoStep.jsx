import React from 'react';
import { User, Mail, Camera } from 'lucide-react';
import UploadWidget from '../../../common/page-components/UploadWidget.jsx';
import defaultUserImg from '../../../../assets/avatar.webp';

const BasicInfoStep = ({
  formData,
  handleInputChange,
  profilePhoto,
  setProfilePhoto,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Basic Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your basic profile information
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={profilePhoto[0] || currentUser.profilePhoto || defaultUserImg}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
          />
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
        </div>

        <UploadWidget
          uwConfig={{
            cloudName: 'calstech',
            uploadPreset: 'estate',
            multiple: false,
            maxImageFileSize: 2000000,
            folder: 'avatars',
          }}
          setState={setProfilePhoto}
        />

        <p className="text-xs text-gray-500 text-center">
          Click to upload your profile picture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User size={16} className="inline mr-2" />
            Username *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
