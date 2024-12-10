import React, { useState } from 'react';

const HideInput = ({ input }) => {
  const [showFullInput, setShowFullInput] = useState(false);

  const handleToggleInput = () => {
    setShowFullInput(!showFullInput);
  };

  const displayInput = input
    ? showFullInput
      ? input
      : input.substring(0, 5) + '*****'
    : null;
  return (
    <div
      className="mt-1 flex-align-center gap-x-2 cursor-pointer"
      onClick={handleToggleInput}
    >
      {displayInput}
    </div>
  );
};

export default HideInput;
