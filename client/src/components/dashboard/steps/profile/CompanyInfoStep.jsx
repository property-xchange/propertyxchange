import React from 'react';
import { Building, Mail, Phone, Camera } from 'lucide-react';
import UploadWidget from '../../../common/page-components/UploadWidget.jsx';
import companyLogo from '../../../../assets/company_logo.png';

const CompanyInfoStep = ({
  formData,
  handleInputChange,
  companyPhoto,
  setCompanyPhoto,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Company Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add your business details and logo
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={companyPhoto[0] || currentUser.companyPhoto || companyLogo}
            alt="Company Logo"
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
            folder: 'logo',
          }}
          setState={setCompanyPhoto}
        />

        <p className="text-xs text-gray-500 text-center">
          Click to upload your company logo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Building size={16} className="inline mr-2" />
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail size={16} className="inline mr-2" />
            Company Email
          </label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your company email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Phone size={16} className="inline mr-2" />
          Company Phone Number
        </label>
        <input
          type="tel"
          name="companyNumber"
          value={formData.companyNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your company phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          About Company
        </label>
        <textarea
          name="aboutCompany"
          value={formData.aboutCompany}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Tell us about your company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Services
        </label>
        <textarea
          name="services"
          value={formData.services}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Services you provide (e.g., facility management)"
        />
      </div>
    </div>
  );
};

export default CompanyInfoStep;
