import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import apiRequest from '../../helper/apiRequest';
import SingleAgentCard from '../common/page-components/SingleAgentCard';
import SingleAgentCardFullWidth from './SingleAgentCardFullWidth';

const AgentList = ({
  filters: externalFilters,
  onFilterChange: externalFilterChange,
  layout = 'grid', // 'grid' or 'fullwidth'
}) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({});

  // Use external filters if provided, otherwise use internal state
  const [internalFilters, setInternalFilters] = useState({
    search: searchParams.get('search') || '',
    verified: searchParams.get('verified') || '',
    accountType: searchParams.get('accountType') || '',
    state: searchParams.get('state') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
  });

  const filters = externalFilters || internalFilters;
  const handleFilterChange = externalFilterChange || handleInternalFilterChange;

  function handleInternalFilterChange(key, value) {
    const newFilters = {
      ...internalFilters,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    };

    setInternalFilters(newFilters);

    // Update URL params only if not using external filters
    if (!externalFilters) {
      const newSearchParams = new URLSearchParams();
      Object.keys(newFilters).forEach((key) => {
        if (newFilters[key]) {
          newSearchParams.set(key, newFilters[key]);
        }
      });
      setSearchParams(newSearchParams);
    }
  }

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest.get(`/agent?${queryParams}`);
      setAgents(response.data.agents || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grid Layout (for standalone AgentList usage)
  if (layout === 'grid') {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Real Estate Agents
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with verified real estate professionals in your area
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
            >
              <option value="">All Agents</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.accountType}
              onChange={(e) =>
                handleFilterChange('accountType', e.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="INDIVIDUAL">Individual Agent</option>
              <option value="LAW">Law Firm</option>
              <option value="SURVEY">Estate Surveying Firm</option>
              <option value="ORGANIZATION">Real Estate Organization</option>
              <option value="DEVELOPER">Developer</option>
              <option value="INVESTOR">Investor</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Ogun">Ogun</option>
              <option value="Rivers">Rivers</option>
              <option value="Kano">Kano</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {(pagination.current - 1) * filters.limit + 1} -{' '}
              {Math.min(pagination.current * filters.limit, pagination.total)}{' '}
              of {pagination.total} results
            </p>
          </div>
        )}

        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No agents found matching your criteria
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {agents.map((agent) => (
              <SingleAgentCard
                key={agent.id}
                {...agent}
                basis="basis-[18rem]"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleFilterChange('page', pagination.current - 1)
                }
                disabled={!pagination.hasPrev}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(Math.min(pagination.pages, 10))].map((_, index) => {
                const startPage = Math.max(1, pagination.current - 5);
                const pageNum = startPage + index;

                if (pageNum > pagination.pages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange('page', pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.current === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  handleFilterChange('page', pagination.current + 1)
                }
                disabled={!pagination.hasNext}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Width Layout (for use within Agents page)
  return (
    <>
      {/* Results Info */}
      {!loading && (
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {(pagination.current - 1) * filters.limit + 1} -{' '}
            {Math.min(pagination.current * filters.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No agents found matching your criteria
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {agents.map((agent) => (
              <SingleAgentCardFullWidth key={agent.id} {...agent} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleFilterChange('page', pagination.current - 1)
                  }
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(Math.min(pagination.pages, 10))].map((_, index) => {
                  const startPage = Math.max(1, pagination.current - 5);
                  const pageNum = startPage + index;

                  if (pageNum > pagination.pages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        pagination.current === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    handleFilterChange('page', pagination.current + 1)
                  }
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AgentList;
