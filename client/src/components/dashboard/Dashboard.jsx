// Modified Dashboard.jsx to accept children
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  FaUsers,
  FaBlog,
  FaEye,
  FaComments,
  FaHome,
  FaHeart,
} from 'react-icons/fa';
import { MdTrendingUp, MdNewReleases } from 'react-icons/md';
import { BsCalendarEvent } from 'react-icons/bs';
import { RiMenuUnfoldLine, RiMenuFoldLine } from 'react-icons/ri';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/features/toggleSlice';
import apiRequest from '../../helper/apiRequest';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar.jsx';

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend && (
          <div className="flex items-center mt-1">
            <MdTrendingUp
              className={`w-4 h-4 ${
                trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            />
            <span
              className={`text-sm ml-1 ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Recent Activity
    </h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${activity.color}`}>
            <activity.icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions = ({ actions }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <action.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

// ADD CHILDREN PROP HERE
const Dashboard = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const isSidebarFolded = useSelector((state) => state.sidebar.isSidebarFolded);

  const [dashboardData, setDashboardData] = useState({
    userStats: {},
    blogStats: {},
    recentActivity: [],
    loading: true,
  });

  useEffect(() => {
    // Only fetch data if no children are provided (i.e., main dashboard)
    if (!children) {
      fetchDashboardData();
    } else {
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  }, [currentUser?.role, children]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const fetchDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      // Fetch data based on user role
      if (currentUser?.role === 'ADMIN') {
        const [userStats, blogStats] = await Promise.all([
          apiRequest.get('/user/admin/stats'),
          apiRequest.get('/blog/admin?limit=1'),
        ]);

        setDashboardData((prev) => ({
          ...prev,
          userStats: userStats.data,
          blogStats: blogStats.data,
          loading: false,
        }));
      } else if (currentUser?.role === 'STAFF') {
        const blogStats = await apiRequest.get('/blog/admin?limit=1');
        setDashboardData((prev) => ({
          ...prev,
          blogStats: blogStats.data,
          loading: false,
        }));
      } else {
        const userListings = await apiRequest.get('/user/profileListings');
        setDashboardData((prev) => ({
          ...prev,
          userListings: userListings.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  const getQuickActions = () => {
    const actions = [];

    if (currentUser?.role === 'ADMIN') {
      actions.push(
        {
          icon: FaUsers,
          label: 'Manage Users',
          onClick: () => (window.location.href = '/user-management'),
        },
        {
          icon: FaBlog,
          label: 'Manage Blogs',
          onClick: () => (window.location.href = '/blog-management'),
        },
        {
          icon: MdNewReleases,
          label: 'Create Blog',
          onClick: () => (window.location.href = '/create-blog'),
        },
        {
          icon: BsCalendarEvent,
          label: 'Categories',
          onClick: () => (window.location.href = '/blog-categories'),
        }
      );
    } else if (currentUser?.role === 'STAFF') {
      actions.push(
        {
          icon: FaBlog,
          label: 'My Blogs',
          onClick: () => (window.location.href = '/blog-management'),
        },
        {
          icon: MdNewReleases,
          label: 'Create Blog',
          onClick: () => (window.location.href = '/create-blog'),
        },
        {
          icon: FaComments,
          label: 'Comments',
          onClick: () => (window.location.href = '/blog-comments'),
        },
        {
          icon: FaHome,
          label: 'Add Property',
          onClick: () => (window.location.href = '/create-listing'),
        }
      );
    } else {
      actions.push(
        {
          icon: FaHome,
          label: 'Add Property',
          onClick: () => (window.location.href = '/create-listing'),
        },
        {
          icon: FaEye,
          label: 'My Properties',
          onClick: () => (window.location.href = '/user-listings'),
        },
        {
          icon: FaHeart,
          label: 'Saved Properties',
          onClick: () => (window.location.href = '/saved-listings'),
        },
        {
          icon: BsCalendarEvent,
          label: 'Profile',
          onClick: () => (window.location.href = '/profile'),
        }
      );
    }

    return actions;
  };

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Users"
          value={dashboardData.userStats.totalUsers || 0}
          icon={FaUsers}
          color="bg-blue-500"
          trend={5.2}
        />
        <DashboardCard
          title="Active Users"
          value={dashboardData.userStats.activeUsers || 0}
          icon={FaUsers}
          color="bg-green-500"
        />
        <DashboardCard
          title="Total Blogs"
          value={dashboardData.blogStats.total || 0}
          icon={FaBlog}
          color="bg-purple-500"
          trend={12.3}
        />
        <DashboardCard
          title="Banned Users"
          value={dashboardData.userStats.bannedUsers || 0}
          icon={FaUsers}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={getQuickActions()} />
        <RecentActivity
          activities={[
            {
              icon: FaUsers,
              title: 'New user registered',
              time: '2 minutes ago',
              color: 'bg-blue-500',
            },
            {
              icon: FaBlog,
              title: 'Blog post published',
              time: '1 hour ago',
              color: 'bg-green-500',
            },
            {
              icon: FaComments,
              title: 'Comment awaiting approval',
              time: '3 hours ago',
              color: 'bg-yellow-500',
            },
          ]}
        />
      </div>
    </>
  );

  const renderStaffDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="My Blog Posts"
          value={
            dashboardData.blogStats.blogs?.filter(
              (blog) => blog.authorId === currentUser.id
            ).length || 0
          }
          icon={FaBlog}
          color="bg-purple-500"
        />
        <DashboardCard
          title="Total Views"
          value="1,234"
          icon={FaEye}
          color="bg-blue-500"
          trend={8.1}
        />
        <DashboardCard
          title="Comments"
          value="89"
          icon={FaComments}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={getQuickActions()} />
        <RecentActivity
          activities={[
            {
              icon: FaBlog,
              title: 'Blog post draft saved',
              time: '30 minutes ago',
              color: 'bg-blue-500',
            },
            {
              icon: FaComments,
              title: 'New comment received',
              time: '2 hours ago',
              color: 'bg-green-500',
            },
            {
              icon: FaEye,
              title: 'Blog post viewed 50 times',
              time: '5 hours ago',
              color: 'bg-purple-500',
            },
          ]}
        />
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="My Properties"
          value={dashboardData.userListings?.userListings?.length || 0}
          icon={FaHome}
          color="bg-blue-500"
        />
        <DashboardCard
          title="Saved Properties"
          value={dashboardData.userListings?.savedListings?.length || 0}
          icon={FaHeart}
          color="bg-red-500"
        />
        <DashboardCard
          title="Profile Views"
          value="156"
          icon={FaEye}
          color="bg-green-500"
          trend={3.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={getQuickActions()} />
        <RecentActivity
          activities={[
            {
              icon: FaHome,
              title: 'Property listing updated',
              time: '1 hour ago',
              color: 'bg-blue-500',
            },
            {
              icon: FaHeart,
              title: 'Property saved',
              time: '4 hours ago',
              color: 'bg-red-500',
            },
            {
              icon: FaEye,
              title: 'Profile viewed',
              time: '1 day ago',
              color: 'bg-green-500',
            },
          ]}
        />
      </div>
    </>
  );

  if (dashboardData.loading && !children) {
    return (
      <div className="flex relative mt-10 border border-1">
        <Toaster position="top-center" reverseOrder={false}></Toaster>
        <div className="">
          <Sidebar isFolded={isSidebarFolded} />
        </div>
        <div className="p-3 w-[100%] overflow-y-auto">
          <div
            className="absolute text-2xl text-white bg-slate-600 p-2 cursor-pointer rounded-sm"
            onClick={handleToggleSidebar}
          >
            {isSidebarFolded ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </div>
          <div className="flex-grow p-8 h-screen overflow-y-auto hide-scrollbar overflow-x-auto w-[400px] sm:w-full">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative mt-10 border border-1">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="">
        <Sidebar isFolded={isSidebarFolded} />
      </div>
      <div className="p-3 w-[100%] overflow-y-auto">
        <div
          className="absolute text-2xl text-white bg-slate-600 p-2 cursor-pointer rounded-sm"
          onClick={handleToggleSidebar}
        >
          {isSidebarFolded ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
        </div>
        <div className="flex-grow p-8 h-screen overflow-y-auto hide-scrollbar overflow-x-auto w-[400px] sm:w-full">
          {/* RENDER CHILDREN IF PROVIDED, OTHERWISE RENDER DASHBOARD CONTENT */}
          {children ? (
            children
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back,{' '}
                  {currentUser?.firstName || currentUser?.username}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Here's what's happening with your{' '}
                  {currentUser?.role === 'ADMIN'
                    ? 'platform'
                    : currentUser?.role === 'STAFF'
                    ? 'content'
                    : 'properties'}{' '}
                  today.
                </p>
              </div>

              {currentUser?.role === 'ADMIN' && renderAdminDashboard()}
              {currentUser?.role === 'STAFF' && renderStaffDashboard()}
              {currentUser?.role === 'USER' && renderUserDashboard()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
