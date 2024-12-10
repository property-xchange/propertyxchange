import { BiMap } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { GoVerified, GoUnverified } from 'react-icons/go';
import AgentNumber from '../../agent/AgentNumber';

const SingleAgentCard = ({
  id,
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
  timestamp,
  address,
}) => {
  return (
    <div className="relative grid grid-cols-1 gap-3 mt-3 overflow-hidden border rounded-lg shadow-light sm:grid-cols-3 md:grid-cols-9 dark:border-card-dark group">
      <div className="sm:col-span-2 h-100">
        <div className="group !opacity-100 overflow-hidden relative h-full">
          <Link to={`/agents/${id}`} className="!opacity-100">
            <img
              src={
                accountType === 'Individual Agent' ||
                accountType === 'Property Owner'
                  ? profilePhoto
                  : companyPhoto
              }
              alt={
                accountType === 'Individual Agent' ||
                accountType === 'Property Owner'
                  ? username + 'pics'
                  : companyName
              }
              className="object-cover w-full h-full"
            />
          </Link>
          {/* <SocialIcons socials={socials} /> */}
        </div>
      </div>
      <div className="sm:col-span-2 md:col-span-7">
        <div className="p-2 flex flex-col">
          <div
            className="flex
           justify-between gap-2 items-start"
          >
            <Link
              to={`/agents/${id}`}
              className="group-hover:text-primary transition-a"
            >
              <h1 className="text-lg font-bold capitalize wrap">
                {accountType === 'Individual Agent' ||
                accountType === 'Property Owner'
                  ? title + ' ' + lastName + ' ' + firstName
                  : companyName}
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
            <p className="text-sm">{address}</p>
          </div>
          <AgentNumber
            phoneNumber={phoneNumber}
            companyNumber={companyNumber}
            accountType={accountType}
          />
          <div className="mt-1 flex justify-between items-end">
            <div>
              <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mr-2">
                {accountType}
              </span>
              <span className="text-green-400 text-xs bg-secondary rounded-md py-1 px-2 mr-2">
                Joined {timestamp}
              </span>
            </div>
            <div>
              <Link to={`/agents/chat/${id}`} className="btn btn-primary mr-3">
                chat
              </Link>
              <Link to={`/agents/${id}`} className="btn btn-secondary">
                details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgentCard;
