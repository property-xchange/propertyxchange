import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard } from 'react-icons/lu';
import { FaListUl } from 'react-icons/fa';
import { MdOutlineAutoGraph } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FaListCheck } from 'react-icons/fa6';
import { LuTicket } from 'react-icons/lu';
import { TiMessages } from 'react-icons/ti';
import { FaRegHeart } from 'react-icons/fa';
import { CgWebsite } from 'react-icons/cg';
import { IoMdLogOut } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/features/toggleSlice';
import { BsHouseAdd } from 'react-icons/bs';
import Avatar from '../../assets/avatar.webp';
import toast, { Toaster } from 'react-hot-toast';
import { logout } from '../../helper/helper';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isFolded }) => {
  const navigate = useNavigate();
  //fetching user data
  const { updateUser, currentUser } = useContext(AuthContext);

  const dispatch = useDispatch();
  const location = useLocation();
  const isLinkActive = (path) => location.pathname === path;
  const isSidebarFolded = useSelector((state) => state.sidebar.isSidebarFolded);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = async () => {
    try {
      await logout();
      updateUser(null);
      navigate('/');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <aside
        className={`flex flex-col ${
          isFolded ? 'w-20' : 'w-64'
        } h-screen px-4 py-8 overflow-y-auto hide-scrollbar bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700`}
      >
        <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className={`object-cover ${
              isFolded ? 'w-10 h-10' : 'w-14 h-14'
            } mx-2 rounded-full`}
            src={currentUser.profilePhoto || Avatar}
            alt="avatar"
          />
          {!isFolded && (
            <>
              <h4 className="mx-2 mt-2 font-medium text-gray-800 dark:text-gray-200">
                {currentUser.firstName || currentUser.username}
              </h4>
              <p className="mx-2 mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                {currentUser.email}
              </p>
            </>
          )}
        </div>

        <div
          className={`flex flex-col justify-between mt-6 
          }`}
        >
          <nav>
            <Link
              className={`flex items-center px-4 py-2 ${
                isLinkActive('/dashboard')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/dashboard"
            >
              <LuLayoutDashboard className="w-5 h-5" />
              {!isFolded && <span className="mx-4 font-medium">Dashboard</span>}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/profile')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/profile"
            >
              <CgProfile className="h-5 w-5" />
              {!isFolded && <span className="mx-4 font-medium">Profile</span>}
            </Link>
            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/user-listings')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/user-listings"
            >
              <FaListUl className="h-5 w-5" />
              {!isFolded && (
                <span className="mx-4 font-medium">Properties</span>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/saved-listings')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/saved-listings"
            >
              <FaRegHeart className="h-5 w-5" />
              {!isFolded && (
                <span className="mx-4 font-medium">Saved Properties</span>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/create-listing')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/create-listing"
            >
              <BsHouseAdd className="h-5 w-5" />
              {!isFolded && (
                <span className="mx-4 font-medium">Post a property</span>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/statistic')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/statistic"
            >
              <MdOutlineAutoGraph className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">Statistic</span>
                  <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                    Soon!
                  </span>
                </>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/leads')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/leads"
            >
              <FaListCheck className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">Manage Leads</span>
                  <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                    Soon!
                  </span>
                </>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/subscription')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/subscription"
            >
              <LuTicket className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">Subscription</span>
                  <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                    Soon!
                  </span>
                </>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('/inbox')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="/inbox"
            >
              <TiMessages className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">Inbox</span>
                  <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                    Soon!
                  </span>
                </>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('#')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              to="#"
            >
              <CgWebsite className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">My Website</span>
                  <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                    Soon!
                  </span>
                </>
              )}
            </Link>

            <Link
              className={`flex items-center px-4 py-2 mt-5 ${
                isLinkActive('#')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-100'
              } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              onClick={handleLogout}
            >
              <IoMdLogOut className="h-5 w-5" />
              {!isFolded && (
                <>
                  <span className="mx-4 font-medium">Logout</span>
                </>
              )}
            </Link>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
