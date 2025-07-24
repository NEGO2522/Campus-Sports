import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './auth/Login';
import Dashboard from './components/Dashboard';
import UserProfileForm from './components/Form';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { auth, db } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
// Import quick action components
import CreateEvent from './components/quick-actions/CreateEvent';
import FindPlayers from './components/quick-actions/FindPlayers';
import JoinGame from './components/quick-actions/JoinGame';
import Schedule from './components/quick-actions/Schedule';
import ManageEvents from './components/quick-actions/ManageEvents';
import TournamentBracket from './components/TournamentBracket';

// Layout component to wrap protected routes with Navbar
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-white shadow-md w-full">
      <Navbar />
    </header>
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-gray-50 w-full">
      {children}
    </main>
  </div>
);

// Component to handle redirection based on profile completion
const AuthCheck = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && userDoc.data().profileCompleted) {
            setIsProfileComplete(true);
            navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
          } else {
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          setIsProfileComplete(false);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    checkProfile();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isProfileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

// Component to handle redirection after login
const LoginRedirect = () => {
  return <Navigate to="/check-profile" replace />;
};

// Component to handle root route based on authentication status
const RootRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCheck, setProfileCheck] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Check if user profile is complete
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().profileCompleted) {
            setProfileCheck('complete');
          } else {
            setProfileCheck('incomplete');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          setProfileCheck('incomplete');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is logged in
  if (user) {
    // If profile is incomplete, redirect to complete profile
    if (profileCheck === 'incomplete') {
      return <Navigate to="/complete-profile" replace />;
    }
    // If profile is complete, redirect to dashboard
    if (profileCheck === 'complete') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user is not logged in, show the landing page
  return <Home />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route 
            path="/login" 
            element={user ? <LoginRedirect /> : <Login />} 
          />
          <Route 
            path="/check-profile" 
            element={<AuthCheck />} 
          />
          <Route 
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <UserProfileForm />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Quick Action Routes */}
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateEvent />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manage-events" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ManageEvents />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/find-players" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FindPlayers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/join-game" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <JoinGame />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Schedule />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/form" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserProfileForm />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          {/* Additional routes for better accessibility */}
          <Route path="/landing" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth-check" element={<AuthCheck />} />
          <Route path="/login-redirect" element={<LoginRedirect />} />
          <Route
            path="/tournament-bracket"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TournamentBracket />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;