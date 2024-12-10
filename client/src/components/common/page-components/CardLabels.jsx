import moment from 'moment';

const cardLabels = ({ purpose, createdAt, updatedAt }) => {
  const displayTime = updatedAt
    ? moment(updatedAt).fromNow()
    : moment(createdAt).fromNow();
  return (
    <div className="absolute top-2 left-2 flex-align-center gap-x-2 text-xs">
      <span className="py-[3px] px-3 text-sm rounded-full capitalize text-white bg-primary">
        {displayTime}
      </span>
      <span className="py-[3px] px-3 text-sm rounded-full capitalize text-white bg-secondary">
        for {purpose}
      </span>
    </div>
  );
};

export default cardLabels;
