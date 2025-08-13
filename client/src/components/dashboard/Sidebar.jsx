import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard } from 'react-icons/lu';
import { FaListUl, FaBlog, FaUsers } from 'react-icons/fa';
import { MdOutlineAutoGraph, MdCategory } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiMessageSquare } from 'react-icons/fi';
import { FaListCheck } from 'react-icons/fa6';
import { LuTicket } from 'react-icons/lu';
import { TiMessages } from 'react-icons/ti';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaRegHeart, FaEdit, FaComments } from 'react-icons/fa';
import { CgWebsite } from 'react-icons/cg';
import { IoMdLogOut } from 'react-icons/io';
import { BsHouseAdd, BsPencilSquare } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/features/toggleSlice';
import Avatar from '../../assets/avatar.webp';
import toast from 'react-hot-toast';
import { logout } from '../../helper/helper';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isFolded }) => {
  const navigate = useNavigate();
  const { updateUser, currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const location = useLocation();
  const isLinkActive = (path) => location.pathname === path;
  const isSidebarFolded = useSelector((state) => state.sidebar.isSidebarFolded);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // console.log(currentUser);

  const handleLogout = async () => {
    try {
      await logout();
      updateUser(null);
      navigate('/');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Helper function to check if user has required role
  const hasRole = (allowedRoles) => {
    return allowedRoles.includes(currentUser?.role);
  };

  // Navigation items with role-based access
  const navigationItems = [
    {
      path: '/dashboard',
      icon: LuLayoutDashboard,
      label: 'Dashboard',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      path: '/listing-management',
      icon: FaEdit,
      label: 'Listing Management',
      roles: ['STAFF', 'ADMIN'],
    },
    {
      path: '/user-listings',
      icon: FaListUl,
      label: 'Properties',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      path: '/saved-listings',
      icon: FaRegHeart,
      label: 'Saved Properties',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      path: '/create-listing',
      icon: BsHouseAdd,
      label: 'Post a property',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    // Blog Management
    {
      path: '/blog-management',
      icon: FaBlog,
      label: 'Blog Management',
      roles: ['STAFF', 'ADMIN'],
    },

    {
      path: '/create-blog',
      icon: BsPencilSquare,
      label: 'Create Blog Post',
      roles: ['STAFF', 'ADMIN'],
    },
    {
      path: '/blog-categories',
      icon: MdCategory,
      label: 'Blog Categories',
      roles: ['ADMIN'],
    },
    {
      path: '/blog-comments',
      icon: FaComments,
      label: 'Manage Comments',
      roles: ['STAFF', 'ADMIN'],
    },
    // User Management (Admin only)
    {
      path: '/user-management',
      icon: FaUsers,
      label: 'User Management',
      roles: ['ADMIN'],
    },
    {
      icon: FiMessageSquare,
      label: 'My Requests',
      path: '/my-requests',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },

    {
      path: '/profile',
      icon: CgProfile,
      label: 'Profile',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      path: '/account-settings',
      icon: IoSettingsOutline,
      label: 'Account Settings',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    // Other features
    {
      path: '/statistic',
      icon: MdOutlineAutoGraph,
      label: 'Statistics',
      roles: ['USER', 'STAFF', 'ADMIN'],
      badge: 'Soon!',
    },
    {
      path: '/leads',
      icon: FaListCheck,
      label: 'Manage Leads',
      roles: ['USER', 'STAFF', 'ADMIN'],
      badge: 'Soon!',
    },
    {
      path: '/subscription',
      icon: LuTicket,
      label: 'Subscription',
      roles: ['USER', 'STAFF', 'ADMIN'],
      badge: 'Soon!',
    },
    {
      path: '/inbox',
      icon: TiMessages,
      label: 'Inbox',
      roles: ['USER', 'STAFF', 'ADMIN'],
      badge: 'Soon!',
    },
    {
      path: '#',
      icon: CgWebsite,
      label: 'My Website',
      roles: ['USER', 'STAFF', 'ADMIN'],
      badge: 'Soon!',
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter((item) =>
    hasRole(item.roles)
  );

  return (
    <div>
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
              {currentUser.role !== 'USER' && (
                <span
                  className={`px-2 py-1 text-xs rounded-full mt-1 ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {currentUser.role}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col justify-between mt-6">
          <nav>
            {filteredNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  className={`flex items-center px-4 py-2 mt-5 ${
                    isLinkActive(item.path)
                      ? 'text-white bg-blue-600'
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                  } transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
                  to={item.path}
                >
                  <IconComponent className="w-5 h-5" />
                  {!isFolded && (
                    <>
                      <span className="mx-4 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="text-[8px] bg-red-600 text-white p-1 font-bold rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              className={`flex items-center w-full px-4 py-2 mt-5 text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-300 transform rounded-lg dark:bg-gray-800 dark:text-gray-200`}
              onClick={handleLogout}
            >
              <IoMdLogOut className="h-5 w-5" />
              {!isFolded && <span className="mx-4 font-medium">Logout</span>}
            </button>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
