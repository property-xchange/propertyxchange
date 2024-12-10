import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../zustand/store.js';

export const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};
