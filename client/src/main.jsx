import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store.js';
import { AnimatePresence } from 'framer-motion';
import { PersistGate } from 'redux-persist/integration/react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { createBrowserRouter } from 'react-router-dom';
import {
  About,
  Agents,
  SingleAgent,
  Home,
  PageNotFound,
  Blog,
  Contact,
  ForgotPassword,
  Register,
  Password,
  Property,
  SignIn,
  Services,
  ResetPassword,
  SingleProperty,
} from './pages';
import { PublicLayout, AuthLayout } from './layout/Layout';
import {
  profilePageLoader,
  propertyLoader,
  singlePropertyLoader,
} from './helper/loader';
import {
  SaveProperty,
  UserListing,
  CreateListing,
  Profile,
  Dashboard,
} from './components/dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import VerifyEmail from './pages/VerifyEmail.jsx';
import AutoLogout from './components/common/AutoLogout.jsx';

const router = createBrowserRouter([
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
          { path: '/forgot-password', element: <ForgotPassword /> },
          { path: '/services', element: <Services /> },
          { path: '/blog', element: <Blog /> },
          {
            path: '/property',
            element: <Property />,
            loader: propertyLoader,
          },
          {
            path: '/property/:id',
            element: <SingleProperty />,
            loader: singlePropertyLoader,
          },
          { path: '/agents/:id', element: <SingleAgent /> },
          { path: '/sign-in', element: <SignIn /> },
          { path: '/verify-email', element: <VerifyEmail /> },
          { path: '/reset-password/:token', element: <ResetPassword /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/profile', element: <Profile /> },
          { path: '/create-listing', element: <CreateListing /> },
          {
            path: '/saved-listings',
            element: <SaveProperty />,
            loader: profilePageLoader,
          },
          {
            path: '/user-listings',
            element: <UserListing />,
            loader: profilePageLoader,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AnimatePresence>
            <ChakraProvider theme={theme}>
              <ErrorBoundary>
                <RouterProvider router={router}>
                  <AutoLogout></AutoLogout>
                </RouterProvider>
              </ErrorBoundary>
            </ChakraProvider>
          </AnimatePresence>
        </PersistGate>
      </Provider>
    </AuthContextProvider>
  </React.StrictMode>
);
