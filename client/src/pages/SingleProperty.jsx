import React, { useContext, useState } from 'react';
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import Slider from '../components/common/page-components/Slider';
import { CiLocationOn } from 'react-icons/ci';
import { TbBed } from 'react-icons/tb';
import { PiToilet } from 'react-icons/pi';
import { TbBath } from 'react-icons/tb';
import Map from '../components/common/page-components/property-filters/Map';
import { AdvancedSearch, CTA } from '../components/common/page-components';
import { YouTubeVideo } from '../components/singleProperty';
import { FaCheck } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';
import { IoMdHeartEmpty } from 'react-icons/io';
import { GoReport } from 'react-icons/go';
import toast from 'react-hot-toast';
import ShareLinks from '../components/common/page-components/SharedLinks';
import ReviewsDisplay from '../components/dashboard/ReviewDisplay.jsx';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Request from '../components/common/page-components/property-filters/Request';
import ReportForm from '../components/forms/ReportForm';
import { GoVerified, GoUnverified } from 'react-icons/go';
import Avatar from '../assets/avatar.webp';
import moment from 'moment';
import apiRequest from '../helper/apiRequest.js';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';

const SingleProperty = () => {
  const listing = useLoaderData();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(listing?.isSaved || false);
  const { currentUser } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!listing) {
    return (
      <div className="w-100 h-100 flex justify-center items-center text-2xl">
        Property not found!
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const propertyData = {
    id: listing.id || '',
    name: listing.name || 'Unnamed Property',
    street: listing.street || 'Unknown location',
    lga: listing.lga || '',
    state: listing.state || '',
    price: listing.price || 0,
    appendTo: listing.appendTo || '',
    offer: listing.offer || false,
    discountPrice: listing.discountPrice || 0,
    discountPercent: listing.discountPercent || 0,
    discountEndDate: listing.discountEndDate || '',
    verification: listing.verification || false,
    images: listing.images || [],
    initialPayment: listing.initialPayment || 0,
    installmentPayment: listing.installmentPayment || 0,
    installmentAppendTo: listing.installmentAppendTo || 'month',
    duration: listing.duration || 0,
    number_of_beds: listing.number_of_beds || 0,
    toilets: listing.toilets || 0,
    number_of_bathrooms: listing.number_of_bathrooms || 0,
    furnished: listing.furnished || false,
    parking: listing.parking || false,
    serviced: listing.serviced || false,
    newlyBuilt: listing.newlyBuilt || false,
    features: listing.features || [],
    description: listing.description || 'No description available',
    youtubeLink: listing.youtubeLink || '',
    user: {
      profilePhoto: listing.user?.profilePhoto || '',
      firstName: listing.user?.firstName || '',
      username: listing.user?.username || 'Unknown User',
      verified: listing.user?.verified || false,
    },
    verified: listing.verified || false,
  };

  // Format price safely
  const formatPrice = (priceValue) => {
    if (!priceValue || priceValue === 0) return '0';
    return new Intl.NumberFormat('en-NG').format(priceValue);
  };

  // Format discount end date safely
  const getDiscountEndText = () => {
    if (!propertyData.discountEndDate) return '';
    try {
      return 'Discount ends ' + moment(propertyData.discountEndDate).fromNow();
    } catch (error) {
      return 'Limited time discount';
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (saved) {
        await apiRequest.post('/user/save', { listingId: propertyData.id });
        setSaved(false);
        toast('Property unsaved');
      } else {
        await apiRequest.post('/user/save', { listingId: propertyData.id });
        setSaved(true);
        toast('Property saved');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong!');
      setSaved((prev) => !prev);
    }
  };

  return (
    <div className="pt-14 px-[3%] md:px-[6%]">
      <div className="grid md:grid-cols-12 gap-x-4 mt-5 w-full">
        <div className="md:col-span-8 mt-5 md:mt-0 h-fit md:sticky top-0">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">
              {propertyData.name}
            </h1>
            {propertyData.verification ? (
              <span className="flex gap-1 text-green-400 justify-center items-center md:text-xl sm:text-xs font-bold">
                <GoVerified className="text-xl" /> Verified Property
              </span>
            ) : (
              <span className="flex gap-1 text-red-400 justify-center items-center md:text-xl sm:text-xs font-bold">
                <GoUnverified className="text-xl" /> Unverified Property
              </span>
            )}
          </div>
          <div className="p-8 md:p-0 relative w-full">
            <Slider images={propertyData.images} />
            <div className="py-5 flex flex-col gap-3">
              <div className="flex gap-3 flex-col lg:flex-row">
                <div className="w-full lg:w-3/4 flex flex-col gap-2">
                  <div>
                    <div className="flex items-center">
                      <CiLocationOn className="w-10 h-10 mr-1 md:w-7 md:h-7 flex-shrink-0" />
                      <span className="text-sm font-normal">
                        {propertyData.street}
                      </span>
                    </div>
                    <p className="uppercase">
                      {propertyData.lga}/{propertyData.state}
                    </p>
                  </div>
                  <div className="flex justify-start items-center gap-2 flex-wrap">
                    {propertyData.offer ? (
                      <>
                        <span className="text-lg font-bold rounded-md text-red-400 line-through">
                          ₦{formatPrice(propertyData.price)}
                          {propertyData.appendTo}
                        </span>
                        <span className="text-lg font-bold rounded-md text-primary">
                          ₦{formatPrice(propertyData.discountPrice)}
                          {propertyData.appendTo}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold rounded-md text-blue-400">
                        ₦{formatPrice(propertyData.price)}/
                        {propertyData.appendTo}
                      </span>
                    )}
                    {propertyData.offer && (
                      <>
                        <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2">
                          {propertyData.discountPercent}% Discount
                        </span>
                        <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2">
                          {getDiscountEndText()}
                        </span>
                      </>
                    )}
                  </div>
                  {propertyData.initialPayment > 0 && (
                    <div className="border dark:border-dark p-2 px-4 rounded-md">
                      <h2 className="uppercase font-bold border-b border-1 dark:border-dark mb-2">
                        Installment Payment
                      </h2>
                      <div className="flex justify-between items-center flex-wrap text-sm gap-2">
                        <div className="mb-1">
                          Initial Payment:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            ₦{formatPrice(propertyData.initialPayment)}
                          </span>
                        </div>
                        <div className="mb-1">
                          {propertyData.installmentAppendTo}ly Installment:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            ₦{formatPrice(propertyData.installmentPayment)}
                          </span>
                        </div>
                        <div className="mb-1">
                          Duration:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            {propertyData.duration}{' '}
                            {propertyData.installmentAppendTo}
                            {propertyData.duration > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-start items-center gap-1 flex-wrap text-xs w-full">
                    <span
                      data-tooltip-id="bed"
                      data-tooltip-content="Number of Bed"
                      className="flex justify-between items-center gap-2 p-2 border dark:border-dark rounded-md"
                    >
                      <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                        <TbBed className="text-xl" />
                      </div>
                      <p>{propertyData.number_of_beds}</p>
                    </span>
                    <Tooltip className="rounded-md" id="bed" />

                    <span
                      data-tooltip-id="toilet"
                      data-tooltip-content="Number of Toilet"
                      className="flex justify-between items-center gap-2 p-2 border dark:border-dark rounded-md"
                    >
                      <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                        <PiToilet className="text-xl" />
                      </div>
                      <p>{propertyData.toilets}</p>
                    </span>
                    <Tooltip className="rounded-md" id="toilet" />
                    <span
                      data-tooltip-id="bathroom"
                      data-tooltip-content="Number of Bathroom"
                      className="flex justify-between items-center gap-2 p-2 border dark:border-dark rounded-md"
                    >
                      <div className="icon-box !w-7 !h-7 bg-primary/20 hover:!bg-primary/40 text-primary">
                        <TbBath className="text-xl" />
                      </div>
                      <p>{propertyData.number_of_bathrooms}</p>
                    </span>
                    <Tooltip className="rounded-md" id="bathroom" />
                    <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
                      {propertyData.furnished ? (
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
                      {propertyData.parking ? (
                        <>
                          <p>parking</p>
                          <FaCheck className="text-green-400" />
                        </>
                      ) : (
                        <>
                          <p>parking</p>
                          <RxCross2 className="text-red-400" />
                        </>
                      )}
                    </span>
                    <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
                      {propertyData.serviced ? (
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
                      {propertyData.newlyBuilt ? (
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
                </div>
                <div className="w-full lg:w-1/4 flex flex-col justify-center items-center gap-1 bg-secondary rounded-md p-3">
                  <img
                    src={propertyData.user.profilePhoto || Avatar}
                    alt={propertyData.user.firstName + `-pics`}
                    className="rounded-full h-20 w-20 object-cover"
                    onError={(e) => {
                      e.target.src = Avatar;
                    }}
                  />
                  <span className="text-blue-400 text-center">
                    {propertyData.user.username}
                  </span>
                  {propertyData.user.verified ? (
                    <span className="flex gap-1 text-green-400 justify-center items-center text-sm font-bold">
                      <GoVerified className="text-sm" /> Verified Agent
                    </span>
                  ) : (
                    <span className="flex gap-1 text-red-400 justify-center items-center text-sm font-bold">
                      <GoUnverified className="text-sm" /> Unverified Agent
                    </span>
                  )}
                  <Link className="mx-2 text-xs font-bold btn btn-primary text-center">
                    CONTACT AGENT
                  </Link>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {propertyData.features.map((feature, index) => (
                  <div
                    key={`feature-${index}`}
                    className="bg-secondary inline-block py-1 px-2 mb-2 rounded-md text-blue-400 text-xs font-bold"
                  >
                    {feature}
                  </div>
                ))}
              </div>
              <Tabs
                variant="enclosed"
                className="transition-opacity duration-300 ease-in-out"
              >
                <TabList>
                  <Tab>Description</Tab>
                  <Tab>Video</Tab>
                  <Tab>Map</Tab>
                  <Tab>Review</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(propertyData.description),
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    <YouTubeVideo youtubeLink={propertyData.youtubeLink} />
                  </TabPanel>
                  <TabPanel>
                    <Map listings={[listing]} />
                  </TabPanel>
                  <TabPanel>
                    <ReviewsDisplay listingId={propertyData.id} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 row-start-3 md:row-start-auto h-fit md:sticky top-0">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <Link
              className={`flex justify-center items-center gap-2 text-xs py-3 rounded-md px-4 uppercase transition-all duration-300 ${
                saved
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-white hover:bg-primary'
              }`}
            >
              <IoMdHeartEmpty className="text-xl" />
              <button onClick={handleSave} className="font-semibold">
                {saved ? 'Property saved' : 'Save property'}
              </button>
            </Link>
            <Button
              onClick={onOpen}
              fontSize="xs"
              color="#02293E"
              textTransform="uppercase"
              _hover={{ color: 'white', backgroundColor: '#02293E' }}
            >
              <GoReport className="text-xl mr-2" />
              Report Property
            </Button>
            <Modal
              isOpen={isOpen}
              onClose={onClose}
              closeOnOverlayClick={false}
              size="xl"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader color="#02293E">Property Report Form</ModalHeader>
                <ModalCloseButton />
                <ModalBody color="#12121">
                  <ReportForm />
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={onClose}
                    backgroundColor="#F7751E"
                    _hover={{ color: 'white', backgroundColor: '#02293E' }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    backgroundColor="#02293E"
                    color="white"
                    _hover={{ color: 'white', backgroundColor: '#F7751E' }}
                  >
                    SUBMIT
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
          <Request />
          <ShareLinks />
          <CTA />
          <AdvancedSearch />
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
