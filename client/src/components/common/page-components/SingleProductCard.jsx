import { BiMap } from 'react-icons/bi';
import { TbBed, TbBath } from 'react-icons/tb';
import { PiToilet } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import CardHoverIcons from './CardHoverIcons';
import CardLabels from './CardLabels';
import moment from 'moment';

const fallbackImage = '/fallback.jpg'; // Ensure this exists in your public folder

const SingleProductCard = ({
  id,
  slug = '',
  name = 'Unnamed Property',
  street = 'Unknown location',
  price = 0,
  toilets = 0,
  installments = false,
  purpose = '',
  number_of_beds = 0,
  number_of_bathrooms = 0,
  offer = false,
  discountPrice = 0,
  discountEndDate = '',
  appendTo = '',
  images = [],
  updatedAt = '',
  createdAt = '',
  basis = 'basis-[18rem]',
}) => {
  return (
    <div
      className={`flex-1 ${basis} shadow-light dark:border-card-dark border rounded-lg overflow-hidden relative group`}
    >
      <div className="group !opacity-100 overflow-hidden relative">
        <Link to={`/property/${slug}`} className="!opacity-100">
          <img
            src={images?.[0] || fallbackImage}
            alt={name}
            className="w-full h-fit md:h-[250px] object-cover group-hover:scale-125 transition-a"
          />
        </Link>
        <CardHoverIcons id={id} />
        <div className="absolute bottom-0 left-0 w-full px-2 py-2 transition-transform bg-gradient-to-t from-black/80 sm:translate-y-10 group-hover:translate-y-0 to-transparent">
          <div className="text-white flex-align-center gap-x-2">
            <BiMap />
            <p>{street}</p>
          </div>
        </div>
      </div>

      <CardLabels
        purpose={purpose}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />

      <div className="p-3">
        <Link
          to={`/property/${slug}`}
          className="group-hover:text-primary transition-a"
        >
          <h1 className="text-lg font-bold capitalize">{name}</h1>
        </Link>

        <div className="flex justify-between mt-3 text-xs">
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

        <div className="mt-1 flex justify-between items-end">
          <div className="flex flex-col">
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
            <div className="flex flex-wrap gap-2">
              {installments && (
                <h2 className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mt-2">
                  Installments
                </h2>
              )}
              {offer && discountEndDate && (
                <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mt-2">
                  {'Discount ends ' + moment(discountEndDate).fromNow()}
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
  );
};

export default SingleProductCard;
