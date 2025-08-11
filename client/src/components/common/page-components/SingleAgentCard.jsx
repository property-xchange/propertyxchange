import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBuilding, FaUser } from 'react-icons/fa';
import { GoVerified, GoUnverified } from 'react-icons/go';

const SingleAgentCard = ({
  id,
  slug,
  username,
  firstName,
  lastName,
  title,
  profilePhoto,
  companyPhoto,
  companyName,
  accountType,
  verified,
  address,
  state,
  lga,
  aboutCompany,
  services,
  phoneNumber,
  whatsAppNum,
  email,
  createdAt,
  _count,
  basis = 'basis-[18rem]',
}) => {
  const getDisplayName = () => {
    if (companyName) return companyName;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    return fullName || username;
  };

  const getDisplayImage = () => {
    return accountType === 'COMPANY'
      ? companyPhoto || '/default-company.png'
      : profilePhoto || '/default-avatar.png';
  };

  const getAccountTypeDisplay = (accountType) => {
    const typeMap = {
      INDIVIDUAL: 'Individual Agent',
      LAW: 'Law Firm',
      SURVEY: 'Estate Surveying Firm',
      ORGANIZATION: 'Real Estate Organization',
      DEVELOPER: 'Developer',
      INVESTOR: 'Investor',
      OTHER: 'Other',
    };
    return typeMap[accountType] || accountType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div
      className={`flex-1 ${basis} shadow-light dark:border-card-dark border rounded-lg overflow-hidden relative group bg-white dark:bg-gray-800`}
    >
      <div className="relative">
        <img
          src={getDisplayImage()}
          alt={getDisplayName()}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          {verified ? (
            <div className="bg-green-500 text-white p-2 rounded-full">
              <GoVerified className="w-4 h-4" />
            </div>
          ) : (
            <div className="bg-red-500 text-white p-2 rounded-full">
              <GoUnverified className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {getDisplayName()}
          </h3>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <FaUser className="mr-2" />
            <span>{getAccountTypeDisplay(accountType)}</span>
          </div>

          {lga && state && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <span>
                {lga}, {state}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaBuilding className="mr-2" />
            <span>{_count?.Listing || 0} Active Listings</span>
          </div>
        </div>

        {aboutCompany && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {aboutCompany}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              verified
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {verified ? 'Verified' : 'Unverified'}
          </span>

          <Link
            to={`/agents/${slug || id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleAgentCard;
