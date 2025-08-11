import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa';

const AgentNumber = ({ accountType, phoneNumber, companyNumber }) => {
  const [showFullNumber, setShowFullNumber] = useState(false);

  const handleToggleNumber = () => {
    setShowFullNumber(!showFullNumber);
  };

  // Determine which number to use based on account type
  const getDisplayNumber = () => {
    const isIndividual =
      accountType === 'Individual Agent' ||
      accountType === 'Property Owner' ||
      accountType === 'INDIVIDUAL';

    const numberToUse = isIndividual
      ? phoneNumber
      : companyNumber || phoneNumber;

    if (!numberToUse) return 'No number available';

    return showFullNumber ? numberToUse : numberToUse.substring(0, 5) + '*****';
  };

  // Don't render if no numbers available
  if (!phoneNumber && !companyNumber) {
    return null;
  }

  return (
    <div
      className="mt-1 flex-align-center gap-x-2 cursor-pointer hover:text-primary transition-colors"
      onClick={handleToggleNumber}
      title="Click to reveal full number"
    >
      <FaPhone className="text-sm" />
      <span className="text-sm">{getDisplayNumber()}</span>
    </div>
  );
};

export default AgentNumber;
