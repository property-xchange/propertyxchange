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
import { property } from '../data/dummyData';
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
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Request from '../components/common/page-components/property-filters/Request';
import ReportForm from '../components/forms/ReportForm';
import { GoVerified, GoUnverified } from 'react-icons/go';
import Avatar from '../assets/avatar.webp';
import moment from 'moment';
import apiRequest from '../helper/apiRequest.js';
import { AuthContext } from '../context/AuthContext';

const SingleProperty = () => {
  const listing = useLoaderData();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(listing.isSaved);
  const { currentUser } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!listing) {
    return (
      <div className="w-100 h-100 flex justify-center items-center text-2xl">
        Property not found!
      </div>
    );
  }

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (saved) {
        await apiRequest.post('/user/save', { listingId: listing.id });
        setSaved(false);
        toast('Property unsaved');
      } else {
        await apiRequest.post('/user/save', { listingId: listing.id });
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
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold md:text-3xl">{listing.name}</h1>
            {listing.verification ? (
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
            <Slider images={listing.images} />
            <div className="py-5 flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-3/4 flex flex-col gap-2">
                  <div>
                    <div className="flex">
                      <CiLocationOn className="w-10 h-10 mr-1 md:w-7 md:h-7" />
                      <span className="text-sm font-normal">
                        {listing.street}
                      </span>
                    </div>
                    <p className="uppercase">
                      {listing.lga}/{listing.state}
                    </p>
                  </div>
                  <div className="flex justify-start items-center gap-2 flex-wrap">
                    {listing.offer ? (
                      <>
                        <span className="text-lg font-bold rounded-md text-red-400 line-through">
                          ₦{listing.price}
                          {listing.appendTo}
                        </span>
                        <span className="text-lg font-bold rounded-md text-primary">
                          ₦{listing.discountPrice}
                          {listing.appendTo}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold rounded-md text-blue-400">
                          ₦{listing.price}/{listing.appendTo}
                        </span>
                        <span></span>
                      </>
                    )}
                    {listing.offer && (
                      <>
                        <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2">
                          {listing.discountPercent}% Discount
                        </span>
                        <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2">
                          {'Discount ends' +
                            ' ' +
                            moment(listing.discountEndDate).fromNow()}
                        </span>
                      </>
                    )}
                  </div>
                  {listing.initialPayment && (
                    <div className="border  dark:border-dark p-2 px-4 rounded-md">
                      <h2 className="uppercase font-bold border-b border-1 dark:border-dark mb-2">
                        Installment Payment
                      </h2>
                      <div className="flex justify-between items-center flex-wrap text-sm">
                        <div className=" mb-1">
                          Initial Payment:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            ₦{listing.initialPayment}
                          </span>
                        </div>
                        <div className=" mb-1">
                          {listing.installmentAppendTo}ly Installment:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            ₦{listing.installmentPayment}
                          </span>
                        </div>
                        <div className=" mb-1">
                          Duration:{' '}
                          <span className="bg-secondary text-green-400 rounded-md py-1 px-2">
                            {listing.duration} {listing.installmentAppendTo}
                            {listing.duration > 1 ? 's' : ''}
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
                      <p>{listing.number_of_beds}</p>
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
                      <p>{listing.toilets}</p>
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
                      <p>{listing.number_of_bathrooms}</p>
                    </span>
                    <Tooltip className="rounded-md" id="bathroom" />
                    <span className="flex justify-between items-center gap-1 p-2 border dark:border-dark rounded-md">
                      {listing.furnished ? (
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
                      {listing.parking ? (
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
                      {listing.serviced ? (
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
                      {listing.newlyBuilt ? (
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
                <div className="w-1/4 flex flex-col justify-center items-center gap-1 bg-secondary rounded-md p-3">
                  <img
                    src={listing.user.profilePhoto || Avatar}
                    alt={listing.user.firstName + `-pics`}
                    className="rounded-full h-20 w-20 object-cover"
                  />
                  <span className="text-blue-400">{listing.user.username}</span>
                  {listing.verified ? (
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
              <div>
                {listing.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-secondary inline-block ml-2 py-1 px-2 mb-2 rounded-md text-blue-400 text-xs font-bold"
                  >
                    {feature}
                  </div>
                ))}
                {listing.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-secondary inline-block ml-2 py-1 px-2 mb-2 rounded-md text-blue-400 text-xs font-bold"
                  >
                    {feature}
                  </div>
                ))}
              </div>
              <Tabs variant="enclosed" transition="opacity 0.3s ease-in-out">
                <TabList>
                  <Tab>Description</Tab>
                  <Tab>Video</Tab>
                  <Tab>Map</Tab>
                  <Tab>Review</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <p>{listing.description}</p>
                  </TabPanel>
                  <TabPanel>
                    <YouTubeVideo youtubeLink={listing.youtubeLink} />
                  </TabPanel>
                  <TabPanel>
                    <Map listings={property} />
                  </TabPanel>
                  <TabPanel></TabPanel>
                </TabPanels>
              </Tabs>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 row-start-3 md:row-start-auto h-fit md:sticky top-0">
          <div className="flex justify-between items-center gap-3">
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
