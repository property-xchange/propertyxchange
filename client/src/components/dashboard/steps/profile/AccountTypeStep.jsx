import React from 'react';
import { User, Building, Scale, MapPin, Users } from 'lucide-react';

const AccountTypeStep = ({ accountType, handleCheckboxChange }) => {
  const accountTypes = [
    {
      id: 'INDIVIDUAL',
      label: 'Individual Agent',
      icon: User,
      description: 'For individual real estate agents',
    },
    {
      id: 'DEVELOPER',
      label: 'Developer',
      icon: Building,
      description: 'For property developers',
    },
    {
      id: 'LAW',
      label: 'Law Firm',
      icon: Scale,
      description: 'For legal firms dealing with real estate',
    },
    {
      id: 'SURVEY',
      label: 'Estate Surveying Firm',
      icon: MapPin,
      description: 'For property surveying companies',
    },
    {
      id: 'ORGANIZATION',
      label: 'Real Estate Organization',
      icon: Users,
      description: 'For real estate organizations',
    },
    {
      id: 'INVESTOR',
      label: 'Investor',
      icon: Scale,
      description: 'For real estate investors',
    },
    {
      id: 'OTHER',
      label: 'Other',
      icon: User,
      description: 'For any other type of real estate agent',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Account Type
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose the type that best describes your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <div key={type.id} className="relative">
              <input
                type="radio"
                id={type.id}
                name="accountType"
                value={type.id}
                checked={accountType === type.id}
                onChange={() => handleCheckboxChange(type.id)}
                className="sr-only"
              />
              <label
                htmlFor={type.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  accountType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                <IconComponent
                  size={24}
                  className={`mr-3 ${
                    accountType === type.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountTypeStep;
