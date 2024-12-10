import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa';

const AgentNumber = ({ accountType, phoneNumber, companyNumber }) => {
  const [showFullNumber, setShowFullNumber] = useState(false);

  const handleToggleNumber = () => {
    setShowFullNumber(!showFullNumber);
  };

  // Check if phoneNumber or companyNumber is defined before using substring method
  const displayNumber =
    phoneNumber && companyNumber
      ? showFullNumber
        ? accountType === 'Individual Agent' || accountType === 'Property Owner'
          ? phoneNumber
          : companyNumber
        : accountType === 'Individual Agent' || accountType === 'Property Owner'
        ? phoneNumber.substring(0, 5) + '*****'
        : companyNumber.substring(0, 5) + '*****'
      : '';

  return (
    <div
      className="mt-1 flex-align-center gap-x-2 cursor-pointer"
      onClick={handleToggleNumber}
    >
      <FaPhone className="text-sm" />
      {displayNumber}
    </div>
  );
};

export default AgentNumber;
