import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PublicLayout() {
  return <Outlet />;
}

function AuthLayout() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  // if (!currentUser.emailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return <Outlet />;
}

export { PublicLayout, AuthLayout };
