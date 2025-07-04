import { useContext, useEffect, useState } from 'react';
import {
  FiDelete,
  FiMoon,
  FiSun,
  FiUser,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { BiSearch, BiMenu, BiUser, BiChevronDown } from 'react-icons/bi';
import { MdDashboard, MdFavorite } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import Avatar from '../../assets/avatar.webp';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../helper/helper';
import toast from 'react-hot-toast';

import {
  closeDropdown,
  closeSidebar,
  openSidebar,
  toggleDarkMode,
  uiStore,
} from '../../redux/features/uiSlice';
import { navLinks } from '../../data/navLinks';
import SingleLink from './SingleLink';

const Navbar = () => {
  const rootDoc = document.querySelector(':root');
  const { darkMode, isSidebarOpen } = useSelector(uiStore);
  const { currentUser, updateUser } = useContext(AuthContext);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dark mode toggle
  const handleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  // Store darkmode value to localStorage;
  useEffect(() => {
    if (darkMode) rootDoc.classList.add('dark');
    else rootDoc.classList.remove('dark');
    localStorage.setItem('theme-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleClose = (e) => {
    if (!e.target.classList.contains('link')) {
      dispatch(closeDropdown());
    }
    // Close user menu when clicking outside
    if (!e.target.closest('.user-menu-container')) {
      setShowUserMenu(false);
    }
  };

  const handleCloseSidebar = (e) => {
    if (e.target.classList.contains('mobile-modal')) dispatch(closeSidebar());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setShowSearchBar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      updateUser(null);
      setShowUserMenu(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const userMenuItems = [
    {
      icon: MdDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      icon: FiUser,
      label: 'Profile',
      path: '/profile',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      icon: MdFavorite,
      label: 'Saved Properties',
      path: '/saved-listings',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
    {
      icon: FiSettings,
      label: 'Settings',
      path: '/profile',
      roles: ['USER', 'STAFF', 'ADMIN'],
    },
  ];

  const filteredUserMenuItems = userMenuItems.filter((item) =>
    item.roles.includes(currentUser?.role || 'USER')
  );

  return (
    <div
      className="navbar h-[60px] fixed w-full z-20 top-0 left-0 px-[2%] md:px-[6%] flex-center-between py-[0.35rem] bg-white/90 border-b backdrop-blur-md dark:border-dark dark:bg-card-dark/90 shadow-sm"
      onMouseOver={handleClose}
      onClick={handleClose}
    >
      <Link to="/" className="flex-shrink-0 flex-align-center gap-x-2">
        <img src={Logo} alt="property exchange logo" className="h-[45px]" />
      </Link>

      <div className="flex-align-center gap-x-4">
        {/*-------------------------------------- Desktop Menu------------------------------------- */}
        <ul
          className={`hidden lg:flex-align-center ${
            showSearchBar && '!hidden'
          }`}
        >
          {navLinks.map((link) => (
            <SingleLink {...link} key={link.id} />
          ))}
        </ul>

        {/* Desktop Auth Section */}
        <div
          className={`hidden lg:flex-align-center gap-x-3 ${
            showSearchBar && '!hidden'
          }`}
        >
          {currentUser ? (
            <div className="relative user-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex-align-center gap-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={currentUser.profilePhoto || Avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser.firstName || currentUser.username}
                </span>
                <BiChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-x-3">
                      <img
                        src={currentUser.profilePhoto || Avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currentUser.firstName && currentUser.lastName
                            ? `${currentUser.firstName} ${currentUser.lastName}`
                            : currentUser.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentUser.email}
                        </p>
                        {currentUser.role !== 'USER' && (
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              currentUser.role === 'ADMIN'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {currentUser.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {filteredUserMenuItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={index}
                          to={item.path}
                          className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <IconComponent className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-align-center gap-x-3">
              <NavLink
                to="/register"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Register
              </NavLink>
              <NavLink
                to="/sign-in"
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Login
              </NavLink>
            </div>
          )}
        </div>

        {/*---------------------------------------- Mobile Menu------------------------------------- */}
        <div
          className={`lg:hidden mobile-modal fixed w-screen h-screen top-0 left-0 bg-black/50 z-50 opacity-0 pointer-events-none transition-a ${
            isSidebarOpen && 'open'
          }`}
          onClick={handleCloseSidebar}
        >
          <ul
            className={`mobile-dialog overflow-auto absolute flex flex-col space-y-4 p-4 bg-white dark:bg-card-dark h-screen max-w-[320px] w-full -translate-x-[500px] transition-a ${
              isSidebarOpen && 'open'
            }`}
          >
            <div className="border-b flex-center-between dark:border-slate-800 pb-4">
              <div className="flex items-center gap-x-3">
                <img src={Logo} alt="Logo" className="h-8" />
                <p className="font-semibold text-lg">Menu</p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => dispatch(closeSidebar())}
              >
                <FiDelete className="w-5 h-5" />
              </button>
            </div>

            {/* User Info in Mobile */}
            {currentUser && (
              <div className="border-b dark:border-slate-800 pb-4">
                <div className="flex items-center gap-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={currentUser.profilePhoto || Avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {currentUser.firstName || currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navLinks?.map(({ id, linkText, url, subLinks }) => (
              <div key={id} className="space-y-2">
                <NavLink
                  to={url}
                  end
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                  onClick={() => dispatch(closeSidebar())}
                >
                  {linkText}
                </NavLink>
                {subLinks?.map(({ id, linkText, url }) => (
                  <NavLink
                    key={id}
                    to={url}
                    end
                    className="block ml-4 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => dispatch(closeSidebar())}
                  >
                    {linkText}
                  </NavLink>
                ))}
              </div>
            ))}

            {/* Mobile Auth Section */}
            {currentUser ? (
              <div className="space-y-2 border-t dark:border-slate-800 pt-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => dispatch(closeSidebar())}
                >
                  <MdDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => dispatch(closeSidebar())}
                >
                  <FiUser className="w-5 h-5" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    dispatch(closeSidebar());
                  }}
                  className="flex items-center gap-x-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                >
                  <FiLogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t dark:border-slate-800 pt-4">
                <NavLink
                  to="/register"
                  className="p-3 text-center bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => dispatch(closeSidebar())}
                >
                  Register
                </NavLink>
                <NavLink
                  to="/sign-in"
                  className="p-3 text-center bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                  onClick={() => dispatch(closeSidebar())}
                >
                  Login
                </NavLink>
              </div>
            )}
          </ul>
        </div>

        {/* Right Side Controls */}
        <div className="flex-align-center gap-x-2">
          {/*----------------------------- Search Bar----------------------------------------------------- */}
          <form onSubmit={handleSubmit}>
            <div
              className={`flex-align-center relative h-10 w-10 transition-all duration-300 border-slate-300 dark:border-dark rounded-full ${
                showSearchBar &&
                '!w-[180px] md:!w-[240px] border bg-white dark:bg-gray-800 shadow-lg'
              }`}
            >
              <input
                type="search"
                className={`outline-none border-none h-0 w-0 bg-transparent text-gray-900 dark:text-white ${
                  showSearchBar && '!w-full !h-full px-4 text-sm'
                }`}
                placeholder="Search properties, agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus={showSearchBar}
              />
              <button
                type="button"
                className={`grid flex-shrink-0 rounded-full w-10 h-10 place-items-center transition-colors ${
                  showSearchBar
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-lg transition-all'
                }`}
                onClick={() => {
                  if (showSearchBar && searchTerm.trim()) {
                    handleSubmit({ preventDefault: () => {} });
                  } else {
                    setShowSearchBar(!showSearchBar);
                  }
                }}
              >
                <BiSearch className="text-lg" />
              </button>
            </div>
          </form>

          {/*----------------------------- Dark mode toggle-------------------------------------------------- */}
          <button
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-lg transition-all"
            onClick={handleDarkMode}
          >
            {darkMode ? (
              <FiSun className="w-4 h-4" />
            ) : (
              <FiMoon className="w-4 h-4" />
            )}
          </button>

          {/*----------------------------- Mobile Profile/Login Icon-------------------------------------------------- */}
          {currentUser ? (
            <Link
              to="/dashboard"
              className="lg:hidden w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-lg transition-all"
            >
              <img
                src={currentUser.profilePhoto || Avatar}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            </Link>
          ) : (
            <Link
              to="/sign-in"
              className="lg:hidden w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-lg transition-all"
            >
              <BiUser className="w-4 h-4" />
            </Link>
          )}

          {/*------------------------------- Mobile Menu Toggle------------------------- */}
          <button
            className="lg:hidden w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
            onClick={() => dispatch(openSidebar())}
          >
            <BiMenu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
