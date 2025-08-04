import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState({ loading: true, user: null, profileChecked: false, userRole: '' });
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuthAndProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setStatus(prev => ({ ...prev, loading: false, user: null, profileChecked: false, userRole: '' }));
      return { shouldRedirect: true, redirectTo: '/login', userRole: '' };
    }
    try {
      // Check if user has completed their profile
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const profileCompleted = userDoc.exists() && userDoc.data().profileCompleted;
      const userRole = userDoc.exists() ? (userDoc.data().role || '') : '';
      // Store in local storage for quick access
      if (profileCompleted) {
        localStorage.setItem('profileCompleted', 'true');
      } else {
        localStorage.removeItem('profileCompleted');
      }
      setStatus(prev => ({
        ...prev,
        loading: false,
        user: currentUser,
        profileChecked: profileCompleted,
        userRole
      }));
      return { 
        shouldRedirect: !profileCompleted, 
        redirectTo: '/complete-profile',
        userRole
      };
    } catch (error) {
      setStatus(prev => ({ ...prev, loading: false, user: currentUser, profileChecked: false, userRole: '' }));
      return { shouldRedirect: true, redirectTo: '/complete-profile', userRole: '' };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const { shouldRedirect, redirectTo } = await checkAuthAndProfile(currentUser);
      
      // Only navigate if we're not already on the target page
      if (shouldRedirect && !location.pathname.startsWith(redirectTo)) {
        navigate(redirectTo, { 
          state: { from: location },
          replace: true 
        });
      }
    });

    return () => unsubscribe();
  }, [checkAuthAndProfile, location, navigate]);

  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!status.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but profile not complete, redirect to form
  if (!status.profileChecked) {
    // Only redirect if not already on the complete-profile page
    if (!location.pathname.startsWith('/complete-profile')) {
      return <Navigate to="/complete-profile" state={{ from: location }} replace />;
    }
    return children;
  }


  const isAdminRoute = (
    location.pathname.startsWith('/create-event') ||
    location.pathname.startsWith('/manage-events') ||
    /^\/events\/[^/]+$/.test(location.pathname)
  );
  if (isAdminRoute && status.userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default ProtectedRoute;
