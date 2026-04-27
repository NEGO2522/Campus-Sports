import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn, isProfileComplete } from '../utils/auth';

// No Firebase. Auth state comes from our own JWT in localStorage.
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isProfileComplete() && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
