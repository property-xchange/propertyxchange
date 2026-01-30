// client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { AnimatePresence } from "framer-motion";
import { PersistGate } from "redux-persist/integration/react";
import { ChakraProvider } from "@chakra-ui/react";
import { HelmetProvider } from "react-helmet-async";
import theme from "./theme";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { createBrowserRouter } from "react-router-dom";
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
  Profile,
  SignIn,
  Services,
  ResetPassword,
  SingleProperty,
  CreateListing,
} from "./pages";
import {
  PublicLayout,
  AuthLayout,
  StaffLayout,
  AdminLayout,
} from "./layout/Layout";
import {
  profilePageLoader,
  propertyLoader,
  singlePropertyLoader,
  agentLoader,
  editListingLoader,
} from "./helper/loader";
import { SaveProperty, UserListing, Dashboard } from "./components/dashboard";

// IMPORT THE NEW BLOG AND ADMIN COMPONENTS
import BlogManagement from "./components/dashboard/BlogManagement.jsx";
import BlogList from "./components/blog/BlogList.jsx";
import SingleBlog from "./components/blog/SingleBlog.jsx";
import UserManagement from "./components/dashboard/UserManagement.jsx";
import ListingManagement from "./components/dashboard/ListingManagement.jsx";
import BlogCategories from "./components/dashboard/BlogCategories.jsx";
import BlogComments from "./components/blog/BlogComments";

import ErrorBoundary from "./components/common/ErrorBoundary";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import AutoLogout from "./components/common/AutoLogout.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";

// Import Error Components
import AgentErrorPage from "./components/error/AgentErrorPage.jsx";
import GeneralErrorPage from "./components/error/GeneralErrorPage.jsx";
import RequestForm from "./components/forms/RequestForm.jsx";
import ViewRequests from "./pages/ViewRequests.jsx";
import MyRequests from "./pages/MyRequest.jsx";
import DashboardRequest from "./components/dashboard/DashboardRequest.jsx";

// IMPORTANT: Import apiRequest for the edit listing loader
import apiRequest from "./helper/apiRequest.js";
import ReviewManagement from "./components/dashboard/ReviewManagement.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <GeneralErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/register", element: <Register /> },
          { path: "/about-us", element: <About /> },
          { path: "/contact-us", element: <Contact /> },

          // Main agents page
          { path: "/agents", element: <Agents /> },

          // Agent type routes - all use the same Agents component
          { path: "/agents/property-owner", element: <Agents /> },
          { path: "/agents/individual-agent", element: <Agents /> },
          { path: "/agents/developer", element: <Agents /> },
          { path: "/agents/law-firm", element: <Agents /> },
          { path: "/agents/surveying", element: <Agents /> },
          { path: "/agents/real-estate-organization", element: <Agents /> },

          // Single agent route (should come after type routes to avoid conflicts)
          {
            path: "/agents/:slugOrId",
            element: <SingleAgent />,
            loader: agentLoader,
            errorElement: <AgentErrorPage />,
          },
          { path: "/post-property", element: <RequestForm /> },
          { path: "/property-request", element: <ViewRequests /> },

          { path: "/my-requests", element: <MyRequests /> },

          { path: "*", element: <PageNotFound /> },
          { path: "/password", element: <Password /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/services", element: <Services /> },
          { path: "/blog", element: <BlogList /> },
          { path: "/blog/:slug", element: <SingleBlog /> },
          {
            path: "/property",
            element: <Property />,
            loader: propertyLoader,
            errorElement: <GeneralErrorPage />,
          },
          {
            path: "/property/:id",
            element: <SingleProperty />,
            loader: singlePropertyLoader,
            errorElement: <GeneralErrorPage />,
          },
          { path: "/sign-in", element: <SignIn /> },
          { path: "/verify-email", element: <VerifyEmail /> },
          { path: "/reset-password/:token", element: <ResetPassword /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/profile", element: <Profile /> },
          { path: "/create-listing", element: <CreateListing /> },
          {
            path: "/edit-listing/:id",
            element: <CreateListing />, // Remove isEdit prop, handle it in component
            loader: editListingLoader, // Use the dedicated loader
            errorElement: <GeneralErrorPage />,
          },
          {
            path: "/dashboard/property-request",
            element: <DashboardRequest />,
          },
          {
            path: "/saved-listings",
            element: <SaveProperty />,
            loader: profilePageLoader,
            errorElement: <GeneralErrorPage />,
          },
          {
            path: "/user-listings",
            element: <UserListing />,
            loader: profilePageLoader,
            errorElement: <GeneralErrorPage />,
          },
          { path: "/account-settings", element: <AccountSettings /> },
        ],
      },
      {
        element: <StaffLayout />,
        children: [
          { path: "/blog-management", element: <BlogManagement /> },
          // { path: "/create-blog", element: <CreateEditBlog /> },
          // { path: "/edit-blog/:id", element: <CreateEditBlog /> },
          { path: "/blog-comments", element: <BlogComments /> },
          { path: "/listing-management", element: <ListingManagement /> },
          { path: "/review-management", element: <ReviewManagement /> },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          { path: "/user-management", element: <UserManagement /> },
          { path: "/blog-categories", element: <BlogCategories /> },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthContextProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AnimatePresence>
              <ChakraProvider theme={theme}>
                <ErrorBoundary>
                  <RouterProvider router={router}>
                    <AutoLogout />
                  </RouterProvider>
                </ErrorBoundary>
              </ChakraProvider>
            </AnimatePresence>
          </PersistGate>
        </Provider>
      </AuthContextProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
