import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BiMap } from 'react-icons/bi';
import { GoVerified, GoUnverified } from 'react-icons/go';
import AgentNumber from './AgentNumber';

const SingleAgentCardFullWidth = ({
  id,
  slug,
  title,
  username,
  verified,
  lastName,
  firstName,
  phoneNumber,
  companyNumber,
  profilePhoto,
  companyName,
  companyPhoto,
  accountType,
  createdAt,
  address,
  lga,
  state,
  _count,
}) => {
  const getDisplayName = () => {
    if (companyName) return companyName;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    return fullName || username;
  };

  const getDisplayImage = () => {
    return accountType === 'COMPANY'
      ? companyPhoto || '/default-company.png'
      : profilePhoto || '/default-avatar.png';
  };

  const getAccountTypeDisplay = (accountType) => {
    const typeMap = {
      INDIVIDUAL: 'Individual Agent',
      LAW: 'Law Firm',
      SURVEY: 'Estate Surveying Firm',
      ORGANIZATION: 'Real Estate Organization',
      DEVELOPER: 'Developer',
      INVESTOR: 'Investor',
      OTHER: 'Other',
    };
    return typeMap[accountType] || accountType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="relative grid grid-cols-1 gap-3 mt-3 overflow-hidden border rounded-lg shadow-light sm:grid-cols-3 md:grid-cols-9 dark:border-card-dark group">
      <div className="sm:col-span-2 h-100">
        <div className="group !opacity-100 overflow-hidden relative h-full">
          <Link to={`/agents/${slug || id}`} className="!opacity-100">
            <img
              src={getDisplayImage()}
              alt={getDisplayName()}
              className="object-cover w-full h-full"
            />
          </Link>
        </div>
      </div>

      <div className="sm:col-span-2 md:col-span-7">
        <div className="p-2 flex flex-col">
          <div className="flex justify-between gap-2 items-start">
            <Link
              to={`/agents/${slug || id}`}
              className="group-hover:text-primary transition-a"
            >
              <h1 className="text-lg font-bold capitalize wrap">
                {getDisplayName()}
              </h1>
            </Link>
            {verified ? (
              <div className="flex gap-1 text-green-400 justify-center items-center text-xs font-bold">
                <GoVerified className="text-xl" /> Verified Agent
              </div>
            ) : (
              <div className="flex gap-1 text-red-400 justify-center items-center text-xs font-bold">
                <GoUnverified className="text-xl" /> Unverified Agent
              </div>
            )}
          </div>

          <div className="mt-1 flex-align-center gap-x-2">
            <BiMap />
            <p className="text-sm">{address || `${lga}, ${state}`}</p>
          </div>

          {(phoneNumber || companyNumber) && (
            <AgentNumber
              phoneNumber={phoneNumber}
              companyNumber={companyNumber}
              accountType={getAccountTypeDisplay(accountType)}
            />
          )}

          <div className="mt-1 flex justify-between items-end">
            <div>
              <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mr-2">
                {getAccountTypeDisplay(accountType)}
              </span>
              <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mr-2">
                {_count?.Listing || 0} Properties
              </span>
              <span className="text-blue-400 text-xs bg-secondary rounded-md py-1 px-2 mr-2">
                Joined {formatDate(createdAt)}
              </span>
            </div>
            <div>
              <Link
                to={`/agents/chat/${slug || id}`}
                className="btn btn-primary mr-3"
              >
                Chat
              </Link>
              <Link to={`/agents/${slug || id}`} className="btn btn-secondary">
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgentCardFullWidth;
