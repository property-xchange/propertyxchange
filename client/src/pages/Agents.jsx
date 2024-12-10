import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  openAgentInfo,
  closeAgentInfo,
  uiStore,
} from '../redux/features/uiSlice';
import { locationData, userData } from '../data/dummyData';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Request from '../components/common/page-components/property-filters/Request';
import ShareLinks from '../components/common/page-components/SharedLinks';
import {
  CTA,
  Pagination,
  TopRated,
} from '../components/common/page-components';
import { navLinks } from '../data/navLinks';
import { AgentList } from '../components/agent';

const Agents = () => {
  const pageNumber = 18;
  const { isAgentInfoOpen } = useSelector(uiStore);
  const dispatch = useDispatch();
  const handleCloseAgentInfo = (e) => {
    if (e.target.classList.contains('filter-modal')) dispatch(closeAgentInfo());
  };

  return (
    <div className="pt-20 px-[3%] md:px-[6%]">
      <div className="flex-col gap-4 flex-center-between md:flex-row">
        <div className="w-full flex-center-between">
          <div className="gap-2 flex-align-center">
            <p className="uppercase text-2xl font-bold tracking-[4px]">
              All Agents
            </p>
          </div>
          <p>Showing 01 - 08 of 28 results</p>
        </div>
        <div className="w-full gap-4 flex-center-between">
          <input
            data-tooltip-id="keyword"
            data-tooltip-content="Enter keywords..."
            type="text"
            className="border outline-none bg-transparent dark:border-dark px-3 py-[0.35rem] w-full"
            placeholder="Keywords.."
          />
          <Tooltip id="keyword" className="rounded-md z-30" />

          <select
            data-tooltip-id="agent"
            data-tooltip-content="Property agent category"
            name=""
            id=""
            className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
          >
            <option value="all">All</option>
            {navLinks.map((category, i) => (
              <option key={i} value={category.linkText}>
                {category.linkText}
              </option>
            ))}
          </select>
          <Tooltip id="agent" className="rounded-md z-30" />
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
      </div>
      <div className="grid md:grid-cols-3 gap-x-4 mt-5">
        <div className="md:col-span-2 mt-5 md:mt-0 h-fit md:sticky top-0 ">
          <AgentList />
          <Pagination itemsPerPage={pageNumber} pageData={userData} />
        </div>
        <div className="md:col-span-1 row-start-3 md:row-start-auto h-fit md:sticky top-0">
          <Request />
          <ShareLinks />
          <CTA />
          <TopRated />
        </div>
      </div>
    </div>
  );
};

export default Agents;
