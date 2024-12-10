import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import {
  About,
  Agents,
  SingleAgent,
  Home,
  PageNotFound,
  Profile,
  Blog,
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
import { PublicLayout, AuthLayout } from '../layout/Layout';
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
          { path: '/blog', element: <Blog /> },
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
        ],
      },
    ],
  },
]);
