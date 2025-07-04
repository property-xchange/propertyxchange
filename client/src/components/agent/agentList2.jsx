import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBuilding, FaUser } from 'react-icons/fa';
import { GoVerified, GoUnverified } from 'react-icons/go';
import apiRequest from '../../helper/apiRequest';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    verified: '',
    accountType: '',
    state: '',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({});

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

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
            onChange={(e) => handleFilterChange('accountType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual Agent</option>
            <option value="COMPANY">Company</option>
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
            {/* Add more states */}
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
            No agents found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="relative">
                <img
                  src={
                    agent.accountType === 'COMPANY'
                      ? agent.companyPhoto || '/default-company.png'
                      : agent.profilePhoto || '/default-avatar.png'
                  }
                  alt={agent.companyName || agent.username}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  {agent.verified ? (
                    <div className="bg-green-500 text-white p-2 rounded-full">
                      <GoVerified className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white p-2 rounded-full">
                      <GoUnverified className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {agent.companyName ||
                      `${agent.firstName || ''} ${
                        agent.lastName || ''
                      }`.trim() ||
                      agent.username}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <FaUser className="mr-2" />
                    <span className="capitalize">
                      {agent.accountType?.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>
                      {agent.lga}, {agent.state}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaBuilding className="mr-2" />
                    <span>{agent._count.listings} Active Listings</span>
                  </div>
                </div>

                {agent.aboutCompany && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {agent.aboutCompany}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      agent.verified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {agent.verified ? 'Verified' : 'Unverified'}
                  </span>

                  <Link
                    to={`/agents/${agent.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', pagination.current - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(pagination.pages)].map((_, index) => {
              const pageNum = index + 1;
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
              onClick={() => handleFilterChange('page', pagination.current + 1)}
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
};

export default AgentList;
