import moment from 'moment';

const CardLabels = ({ purpose, createdAt, updatedAt }) => {
  // Handle null/undefined values safely
  const getDisplayTime = () => {
    if (updatedAt) {
      return moment(updatedAt).fromNow();
    }
    if (createdAt) {
      return moment(createdAt).fromNow();
    }
    return 'Recently';
  };

  const displayTime = getDisplayTime();
  const displayPurpose = purpose || 'sale';

  return (
    <div className="absolute top-2 left-2 flex-align-center gap-x-2 text-xs">
      <span className="py-[3px] px-3 text-sm rounded-full capitalize text-white bg-primary">
        {displayTime}
      </span>
      <span className="py-[3px] px-3 text-sm rounded-full capitalize text-white bg-secondary">
        for {displayPurpose}
      </span>
    </div>
  );
};

export default CardLabels;
