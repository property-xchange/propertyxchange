import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaBuilding,
} from 'react-icons/fa';
import { GoVerified, GoUnverified } from 'react-icons/go';
import { FiGrid, FiList } from 'react-icons/fi';
import apiRequest from '../helper/apiRequest';
import PropertyList from '../components/property/PropertyList';
import PropertyFullWidth from '../components/common/page-components/PropertyFullWidth';

const SingleAgent = () => {
  const { slugOrId } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredListings, setFilteredListings] = useState([]);

  useEffect(() => {
    fetchAgent();
  }, [slugOrId]);

  useEffect(() => {
    if (agent?.Listing) {
      const filtered = agent.Listing.filter(
        (listing) =>
          listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.street.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [agent, searchTerm]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get(`/agent/${slugOrId}`);
      setAgent(response.data);
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getDisplayName = () => {
    if (!agent) return '';
    return (
      agent.companyName ||
      `${agent.firstName || ''} ${agent.lastName || ''}`.trim() ||
      agent.username
    );
  };

  const getDisplayImage = () => {
    if (!agent) return '/default-avatar.png';
    return agent.accountType === 'COMPANY'
      ? agent.companyPhoto || '/default-company.png'
      : agent.profilePhoto || '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="pt-20 px-[3%] md:px-[6%]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="pt-20 px-[3%] md:px-[6%]">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-[3%] md:px-[6%]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getDisplayName()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {agent.accountType?.toLowerCase().replace('_', ' ')} • {agent.lga},{' '}
            {agent.state}
          </p>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          {agent.verified ? (
            <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
              <GoVerified className="text-xl" />
              <span className="font-semibold">Verified Agent</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
              <GoUnverified className="text-xl" />
              <span className="font-semibold">Unverified Agent</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Agent Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={getDisplayImage()}
                alt={getDisplayName()}
                className="w-full md:w-48 h-48 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {agent.accountType?.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Member since {formatDate(agent.createdAt)}
                    </span>
                  </div>
                </div>

                {agent.aboutCompany && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      About
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {agent.aboutCompany}
                    </p>
                  </div>
                )}

                {agent.services && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Services
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {agent.services}
                    </p>
                  </div>
                )}

                {agent.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaPhone className="text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Phone Number
                      </p>
                      <a
                        href={`tel:${agent.phoneNumber}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {agent.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                {agent.whatsAppNum && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaWhatsapp className="text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        WhatsApp
                      </p>
                      <a
                        href={`https://wa.me/${agent.whatsAppNum.replace(
                          /[^0-9]/g,
                          ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 dark:text-green-400 hover:underline"
                      >
                        {agent.whatsAppNum}
                      </a>
                    </div>
                  </div>
                )}

                {agent.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaEnvelope className="text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Email
                      </p>
                      <a
                        href={`mailto:${agent.email}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {agent.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Listings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                Properties ({agent._count?.Listing || 0})
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`p-2 rounded-lg ${
                      layout === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    className={`p-2 rounded-lg ${
                      layout === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Properties */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'No properties match your search'
                    : 'No properties available'}
                </p>
              </div>
            ) : layout === 'grid' ? (
              <PropertyList properties={filteredListings} />
            ) : (
              <PropertyFullWidth properties={filteredListings} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>

            <div className="space-y-4">
              {agent.address && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FaMapMarkerAlt className="text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href={`mailto:${agent.email}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {agent.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-center">
                <FaBuilding className="text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {agent._count?.Listing || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Listings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgent;
