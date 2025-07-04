import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import {
  About,
  Agents,
  SingleAgent,
  Home,
  PageNotFound,
  Profile,
  Contact,
  Recovery,
  Register,
  Password,
  Property,
  SignIn,
  Services,
  Reset,
  SingleProperty,
} from '../pages';
import Dashboard from '../components/common/page-components/Dashboard';
import CreateListing from '../components/common/page-components/CreateListing';
import UserListings from '../components/common/page-components/UserListings';
import SavedListings from '../components/common/page-components/SavedListings';
import BlogManagement from '../components/dashboard/BlogManagement';
import CreateEditBlog from '../components/blog/CreateEditBlog';
import { BlogList } from '../components/blog/BlogComponents';
import SingleBlog from '../components/blog/SingleBlog';
import UserManagement from '../components/dashboard/UserManagement';
import BlogCategories from '../components/dashboard/BlogCategories';
import BlogComments from '../components/blog/BlogComments';
import {
  PublicLayout,
  AuthLayout,
  AdminLayout,
  StaffLayout,
} from '../layout/Layout';
import { propertyLoader, singlePropertyLoader } from './loader';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/register', element: <Register /> },
          { path: '/about-us', element: <About /> },
          { path: '/contact-us', element: <Contact /> },
          { path: '/agents', element: <Agents /> },
          { path: '*', element: <PageNotFound /> },
          { path: '/password', element: <Password /> },
          { path: '/recovery', element: <Recovery /> },
          { path: '/services', element: <Services /> },
          { path: '/blog', element: <BlogList /> },
          { path: '/blog/:slug', element: <SingleBlog /> },
          { path: '/property', element: <Property />, loader: propertyLoader },
          {
            path: '/property/:id',
            element: <SingleProperty />,
            loader: singlePropertyLoader,
          },
          { path: '/agents/:id', element: <SingleAgent /> },
          { path: '/sign-in', element: <SignIn /> },
          { path: '/reset-password', element: <Reset /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/profile', element: <Profile /> },
          { path: '/create-listing', element: <CreateListing /> },
          { path: '/user-listings', element: <UserListings /> },
          { path: '/saved-listings', element: <SavedListings /> },
        ],
      },
      {
        element: <StaffLayout />,
        children: [
          { path: '/blog-management', element: <BlogManagement /> },
          { path: '/create-blog', element: <CreateEditBlog /> },
          { path: '/edit-blog/:id', element: <CreateEditBlog /> },
          { path: '/blog-comments', element: <BlogComments /> },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          { path: '/user-management', element: <UserManagement /> },
          { path: '/blog-categories', element: <BlogCategories /> },
        ],
      },
    ],
  },
]);
