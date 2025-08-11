import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Request from '../components/common/page-components/property-filters/Request';
import ShareLinks from '../components/common/page-components/SharedLinks';
import { CTA, TopRated } from '../components/common/page-components';
import { AgentList } from '../components/agent';

const Agents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    verified: searchParams.get('verified') || '',
    accountType: searchParams.get('accountType') || '',
    state: searchParams.get('state') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
  });

  // Account type mapping for navigation
  const accountTypeMap = {
    'property-owner': 'INDIVIDUAL',
    'individual-agent': 'INDIVIDUAL',
    developer: 'DEVELOPER',
    'law-firm': 'LAW',
    surveying: 'SURVEY',
    'real-estate-organization': 'ORGANIZATION',
  };

  // Extract account type from URL whenever location changes
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path); // Debug log

    // Reset filters when path changes (except page)
    const newFilters = {
      search: '',
      verified: '',
      accountType: '',
      state: '',
      page: 1,
      limit: 12,
    };

    // Check if we're on a specific agent type path
    const typeFromPath = Object.keys(accountTypeMap).find(
      (key) => path.includes(`/agents/${key}`) || path.endsWith(`/${key}`)
    );

    console.log('Type from path:', typeFromPath); // Debug log

    if (typeFromPath) {
      const mappedType = accountTypeMap[typeFromPath];
      console.log('Mapped type:', mappedType); // Debug log
      newFilters.accountType = mappedType;
    }

    // Apply any URL params on top of the base filters
    const urlSearch = searchParams.get('search');
    const urlVerified = searchParams.get('verified');
    const urlState = searchParams.get('state');
    const urlPage = searchParams.get('page');
    const urlLimit = searchParams.get('limit');
    const urlAccountType = searchParams.get('accountType');

    if (urlSearch) newFilters.search = urlSearch;
    if (urlVerified) newFilters.verified = urlVerified;
    if (urlState) newFilters.state = urlState;
    if (urlPage) newFilters.page = parseInt(urlPage);
    if (urlLimit) newFilters.limit = parseInt(urlLimit);
    // Only use URL accountType if no type was extracted from path
    if (urlAccountType && !typeFromPath)
      newFilters.accountType = urlAccountType;

    console.log('New filters:', newFilters); // Debug log

    setFilters(newFilters);

    // Update URL params to match the new filters
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        newSearchParams.set(key, newFilters[key]);
      }
    });

    // Only update search params if they've actually changed
    const currentParams = searchParams.toString();
    const newParams = newSearchParams.toString();
    if (currentParams !== newParams) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [location.pathname]); // Re-run when pathname changes

  // Handle URL search params changes
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      verified: searchParams.get('verified') || '',
      accountType: searchParams.get('accountType') || '',
      state: searchParams.get('state') || '',
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 12,
    };

    // Only update if filters have actually changed
    const filtersChanged = Object.keys(urlFilters).some(
      (key) => filters[key] !== urlFilters[key]
    );

    if (filtersChanged) {
      setFilters(urlFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    };

    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        newSearchParams.set(key, newFilters[key]);
      }
    });
    setSearchParams(newSearchParams);
  };

  const getAccountTypeDisplay = (accountType) => {
    const typeMap = {
      INDIVIDUAL: 'Individual Agent',
      LAW: 'Law Firm',
      SURVEY: 'Estate Surveying Firm',
      ORGANIZATION: 'Real Estate Organization',
      DEVELOPER: 'Developer',
      INVESTOR: 'Investor',
    };
    return typeMap[accountType] || accountType;
  };

  const nigerianStates = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'FCT - Abuja',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
  ];

  return (
    <div className="pt-20 px-[3%] md:px-[6%]">
      {/* Header */}
      <div className="flex-col gap-4 flex-center-between md:flex-row">
        <div className="w-full flex-center-between">
          <div className="gap-2 flex-align-center">
            <p className="uppercase text-2xl font-bold tracking-[4px]">
              {filters.accountType
                ? getAccountTypeDisplay(filters.accountType)
                : 'All Agents'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="w-full gap-4 flex-center-between">
          <input
            data-tooltip-id="keyword"
            data-tooltip-content="Enter keywords..."
            type="text"
            className="border outline-none bg-transparent dark:border-dark px-3 py-[0.35rem] w-full"
            placeholder="Search agents..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Tooltip id="keyword" className="rounded-md z-30" />

          <select
            data-tooltip-id="agent"
            data-tooltip-content="Property agent category"
            className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
            value={filters.accountType}
            onChange={(e) => {
              const newAccountType = e.target.value;
              handleFilterChange('accountType', newAccountType);

              // If clearing the account type, navigate back to base agents page
              if (!newAccountType) {
                navigate('/agents', { replace: true });
              }
            }}
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual Agent</option>
            <option value="LAW">Law Firm</option>
            <option value="SURVEY">Estate Surveying Firm</option>
            <option value="ORGANIZATION">Real Estate Organization</option>
            <option value="DEVELOPER">Developer</option>
            <option value="INVESTOR">Investor</option>
          </select>
          <Tooltip id="agent" className="rounded-md z-30" />

          <select
            data-tooltip-id="verify"
            data-tooltip-content="Verification Status"
            className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
            value={filters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified</option>
          </select>
          <Tooltip id="verify" className="rounded-md z-30" />

          <select
            data-tooltip-id="agent-state"
            data-tooltip-content="Agent state location"
            className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="">All States</option>
            {nigerianStates.map((state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            ))}
          </select>
          <Tooltip id="agent-state" className="rounded-md z-30" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-x-4 mt-5">
        <div className="md:col-span-2 mt-5 md:mt-0 h-fit">
          {/* Pass filters and handlers to AgentList */}
          <AgentList
            filters={filters}
            onFilterChange={handleFilterChange}
            layout="fullwidth"
            key={`${location.pathname}-${JSON.stringify(filters)}`} // Force re-render when path or filters change
          />
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
