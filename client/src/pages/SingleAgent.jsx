import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiDelete } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  openAgentInfo,
  closeAgentInfo,
  uiStore,
} from '../redux/features/uiSlice';
import { locationData, property, userData } from '../data/dummyData';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Request from '../components/common/page-components/property-filters/Request';
import {
  CTA,
  Pagination,
  PropertyFullWidth,
  TopRated,
} from '../components/common/page-components';
import { navLinks } from '../data/navLinks';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { GrContactInfo } from 'react-icons/gr';
import { FaEnvelope, FaList, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { FiFilter, FiGrid } from 'react-icons/fi';
import SingleAgentCard from '../components/common/page-components/SingleAgentCard';
import { AgentList } from '../components/agent';
import { PropertyList } from '../components/property';
import { GoVerified, GoUnverified } from 'react-icons/go';
import HideInput from '../components/common/page-components/HideInput';
import { FaMapLocation } from 'react-icons/fa6';

const SingleAgent = () => {
  const pageNumber = 18;
  const { id } = useParams();
  const selectedAgent = userData.find((item) => item.id === parseInt(id));
  const { isAgentInfoOpen } = useSelector(uiStore);
  const dispatch = useDispatch();
  const handleCloseAgentInfo = (e) => {
    if (e.target.classList.contains('filter-modal')) dispatch(closeAgentInfo());
  };
  const [layout, setLayout] = useState('grid');

  return (
    <div className="pt-20 px-[3%] md:px-[6%]">
      <div className="flex-col gap-4 flex-center-between md:flex-row">
        <div className="w-full flex-center-between gap-2">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-2xl font-bold capitalize wrap">
              {selectedAgent.accountType === 'Individual Agent' ||
              selectedAgent.accountType === 'Property Owner'
                ? selectedAgent.title +
                  ' ' +
                  selectedAgent.lastName +
                  ' ' +
                  selectedAgent.firstName
                : selectedAgent.companyName}
            </h1>
            {selectedAgent.verified ? (
              <div className="flex gap-1 text-green-400 justify-center items-center md:text-xl sm:text-xs font-bold">
                <GoVerified className="text-xl" /> Verified Agent
              </div>
            ) : (
              <div className="flex gap-1 text-red-400 justify-center items-center md:text-xl sm:text-xs font-bold">
                <GoUnverified className="text-xl" /> Unverified Agent
              </div>
            )}
          </div>
          <div
            className="flex gap-2 p-2 md:hidden rounded-xl place-items-center bg-slate-100 sm:cursor-pointer hover:bg-slate-200 transition-a dark:bg-card-dark"
            onClick={() => dispatch(openAgentInfo())}
          >
            <GrContactInfo className="text-xl" />
            <p>Contact</p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-x-4 mt-5">
        <div className="md:col-span-2 mt-5 md:mt-0 h-fit md:sticky top-0 ">
          <div className="flex-center-between mb-7">
            <img
              src={
                selectedAgent.accountType === 'Individual Agent' ||
                selectedAgent.accountType === 'Property Owner'
                  ? selectedAgent.profilePhoto
                  : selectedAgent.companyPhoto
              }
              alt={
                selectedAgent.accountType === 'Individual Agent' ||
                selectedAgent.accountType === 'Property Owner'
                  ? selectedAgent.username + 'pics'
                  : selectedAgent.companyName
              }
              className="object-cover w-[30%] h-full"
            />
            <div>
              <div className="flex flex-col gap-2">
                <span className="text-green-400 bg-secondary rounded-md py-1 px-2 mr-2">
                  {selectedAgent.accountType}
                </span>
                <span className="text-green-400 bg-secondary rounded-md py-1 px-2 mr-2">
                  Registered {selectedAgent.timestamp}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-7">
            <Accordion>
              {selectedAgent.aboutCompany && (
                <AccordionItem>
                  {({ isExpanded }) => (
                    <>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            About
                          </Box>
                          {isExpanded ? (
                            <MinusIcon fontSize="12px" />
                          ) : (
                            <AddIcon fontSize="12px" />
                          )}
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {selectedAgent.aboutCompany}
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              )}

              {selectedAgent.services && (
                <AccordionItem>
                  {({ isExpanded }) => (
                    <>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            Services
                          </Box>
                          {isExpanded ? (
                            <MinusIcon fontSize="12px" />
                          ) : (
                            <AddIcon fontSize="12px" />
                          )}
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {selectedAgent.services}
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              )}

              <AccordionItem>
                {({ isExpanded }) => (
                  <>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          Address
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize="12px" />
                        ) : (
                          <AddIcon fontSize="12px" />
                        )}
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <p>{selectedAgent.address}</p>
                      <p className="uppercase">
                        {selectedAgent.lga}/{selectedAgent.state}
                      </p>
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            </Accordion>
          </div>
          <div className="flex flex-col w-full gap-2">
            <p className="uppercase text-xl">Agent's Listing(s)</p>
            <div className="flex-center-between gap-2">
              <div className="gap-2 flex-align-center">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center bg-slate-100 hover:bg-slate-200 sm:cursor-pointer transition-a dark:bg-card-dark  ${
                    layout === 'grid' && '!bg-primary text-white'
                  }`}
                  onClick={() => setLayout('grid')}
                >
                  <FiGrid />
                </div>
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center bg-slate-100 sm:cursor-pointer hover:bg-slate-200 transition-a dark:bg-card-dark ${
                    layout === 'list' && '!bg-primary text-white'
                  }`}
                  onClick={() => setLayout('list')}
                >
                  <FaList />
                </div>
              </div>
              <p className="text-center">Showing 01 - 08 of 28 results</p>
            </div>
            <div className="w-full gap-3 flex-center-between">
              <input
                data-tooltip-id="keyword"
                data-tooltip-content="Enter keywords..."
                type="text"
                className="border outline-none bg-transparent dark:border-dark px-3 py-[0.35rem] w-full"
                placeholder="Keywords.."
              />
              <Tooltip id="keyword" className="rounded-md z-30" />

              <select
                data-tooltip-id="verify"
                data-tooltip-content="Verification Status"
                name=""
                id=""
                className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
              >
                <option value="">All</option>
                <option value="latest">Verified Only</option>
              </select>
              <Tooltip id="verify" className="rounded-md z-30" />
              <select
                data-tooltip-id="agent-state"
                data-tooltip-content="Agent state location"
                name=""
                id=""
                className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
              >
                <option value="">All</option>
                {locationData.map((state, index) => (
                  <option key={index} value={state.state}>
                    {state.state}
                  </option>
                ))}
              </select>
              <Tooltip id="agent-state" className="rounded-md z-30" />
            </div>
            <div className="mt-2">
              {layout === 'grid' ? <PropertyList /> : <PropertyFullWidth />}
              <Pagination itemsPerPage={pageNumber} pageData={property} />
            </div>
          </div>
        </div>
        <div className="md:col-span-1 row-start-3 md:row-start-auto h-fit md:sticky top-0">
          <div
            className={`filter-modal ${isAgentInfoOpen && 'open'}`}
            onClick={handleCloseAgentInfo}
          >
            <div className={`filter-dialog ${isAgentInfoOpen && 'open'}`}>
              <div className="flex-center-between border-b dark:border-dark md:hidden">
                <div
                  className="icon-box md:hidden"
                  onClick={() => dispatch(closeAgentInfo())}
                >
                  <FiDelete />
                </div>
                <p className="uppercase">More Agent Information</p>
              </div>
              <div className="p-3 mt-8 border dark:border-dark flex flex-col gap-2">
                <div className="flex gap-2 bg-secondary text-green-400 p-3 rounded-md">
                  <span>
                    <h2 className="font-semibold tracking-[2px]"> Address</h2>
                    {selectedAgent.address}
                  </span>
                </div>
                {selectedAgent.companyNumber && (
                  <div className="flex gap-2 bg-secondary text-green-400 p-3 rounded-md">
                    <span>
                      <h2 className="font-semibold tracking-[2px]">
                        Phone Number
                      </h2>
                      <HideInput input={selectedAgent.companyNumber} />
                    </span>
                  </div>
                )}
                {selectedAgent.whatsAppNum && (
                  <div className="flex gap-2 bg-secondary text-green-400 p-3 rounded-md">
                    <span>
                      <h2 className="font-semibold tracking-[2px]">
                        WhatsApp Number
                      </h2>
                      <HideInput input={selectedAgent.whatsAppNum} />
                    </span>
                  </div>
                )}
                {selectedAgent.companyEmail && (
                  <div className="flex gap-2 bg-secondary text-green-400 p-3 rounded-md">
                    <span>
                      <h2 className="font-semibold tracking-[2px]">
                        Email Address
                      </h2>
                      <HideInput input={selectedAgent.companyEmail} />
                    </span>
                  </div>
                )}
              </div>
              <Request />
              <CTA />
              <TopRated />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgent;
