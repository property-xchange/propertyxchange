import { BiMap } from 'react-icons/bi';
import { TbBed, TbBath } from 'react-icons/tb';
import { PiToilet } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import CardHoverIcons from './CardHoverIcons';
import CardLabels from './CardLabels';
import { FaCheck } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';
import moment from 'moment';

const SingleProductCardFullWidth = ({
  id,
  slug,
  name,
  street,
  price,
  timestamps,
  purpose,
  number_of_beds,
  number_of_bathrooms,
  toilets,
  images,
  description,
  installments,
  textLength,
  showLabels,
  offer,
  discountPrice,
  discountEndDate,
  appendTo,
  furnished,
  parking,
  serviced,
  newlyBuilt,
}) => {
  return (
    <div className="relative grid grid-cols-1 gap-3 mt-3 overflow-hidden border rounded-lg shadow-light sm:grid-cols-3 md:grid-cols-9 dark:border-card-dark group">
      <div className="sm:col-span-3">
        <div className="group !opacity-100 overflow-hidden relative h-full">
          <Link to={`/property/${slug}`} className="!opacity-100">
            <img
              src={images[0]}
              alt={name}
              className="object-cover w-full h-full group-hover:scale-125 transition-a"
            />
          </Link>
          <CardHoverIcons id={id} />
        </div>
        {!showLabels && (
          <CardLabels purpose={purpose} timestamps={timestamps} />
        )}
      </div>
      <div className="sm:col-span-2 md:col-span-6">
        <div className="p-2 flex flex-col">
          <Link
            to={`/property/${slug}`}
            className="group-hover:text-primary transition-a"
          >
            <h1 className="text-lg font-bold capitalize">{name}</h1>
          </Link>

          <div className="mt-2 flex-align-center gap-x-2">
            <BiMap />
            <p>{street}</p>
          </div>
          <p className="mt-2 text-sm">{`${description.slice(
            0,
            textLength || 180
          )}...`}</p>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex-align-center gap-x-2">
              <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                <TbBed />
              </div>
              <p className="text-sm">{number_of_beds} Beds</p>
            </div>
            <div className="flex-align-center gap-x-2">
              <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                <TbBath />
              </div>
              <p className="text-sm">{number_of_bathrooms} Bathrooms</p>
            </div>
            <div className="flex-align-center gap-x-2">
              <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                <PiToilet />
              </div>
              <p className="text-sm">{toilets} Toilets</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs mt-2">
            <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
              {furnished ? (
                <>
                  <p>Furnished</p>
                  <FaCheck className="text-green-400" />
                </>
              ) : (
                <>
                  <p>Furnished</p>
                  <RxCross2 className="text-red-400" />
                </>
              )}
            </span>
            <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
              {parking ? (
                <>
                  <p>Parking</p>
                  <FaCheck className="text-green-400" />
                </>
              ) : (
                <>
                  <p>Parking</p>
                  <RxCross2 className="text-red-400" />
                </>
              )}
            </span>
            <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
              {serviced ? (
                <>
                  <p>Serviced</p>
                  <FaCheck className="text-green-400" />
                </>
              ) : (
                <>
                  <p>Serviced</p>
                  <RxCross2 className="text-red-400" />
                </>
              )}
            </span>
            <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
              {newlyBuilt ? (
                <>
                  <p>Newly Built</p>
                  <FaCheck className="text-green-400" />
                </>
              ) : (
                <>
                  <p>Newly Built</p>
                  <RxCross2 className="text-red-400" />
                </>
              )}
            </span>
          </div>
          <div className="mt-1 flex justify-between items-end">
            <div className="flex flex-col ">
              <div className="flex justify-between flex-wrap gap-2">
                {offer ? (
                  <>
                    <span className="text-lg font-bold rounded-md text-red-400 line-through mt-2">
                      ₦{price}
                      {appendTo}
                    </span>
                    <span className="text-lg font-bold rounded-md text-primary mt-2">
                      ₦{discountPrice}
                      {appendTo}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold rounded-md text-blue-400 mt-2">
                    ₦{price}
                    {appendTo}
                  </span>
                )}
              </div>
              <div className=" flex flex-wrap gap-2">
                {installments && (
                  <h2 className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mt-2">
                    Installments
                  </h2>
                )}
                {offer && (
                  <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mt-2">
                    {'Discount ends' + ' ' + moment(discountEndDate).fromNow()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Link to={`/property/${slug}`} className="btn btn-secondary">
                details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductCardFullWidth;
