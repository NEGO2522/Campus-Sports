import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './auth/Login';
import Dashboard from './components/Dashboard';
import UserProfileForm from './components/Form';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { auth, db } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import CreateEvent from './components/quick-actions/CreateEvent';
import ManageEvents from './components/quick-actions/ManageEvents';
import TournamentBracket from './components/TournamentBracket';
import Participate from './components/Participate';
import CreateTeam from './components/CreateTeam';
import Notification from './components/Notification';
import EventDetail from './components/EventDetail';
import EditMatch from './components/EditMatch';
import About from './components/About';
import ContactUs from './components/ContactUs';
import Leaderboard from './components/Leaderboard';

// Layout component
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="w-full">
      <Navbar />
    </header>
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-gray-50 w-full">
      {children}
    </main>
  </div>
);

// Profile completion check
const AuthCheck = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          setIsProfileComplete(!!(userDoc.exists() && userDoc.data().profileCompleted));
        } catch (error) {
          console.error('Error checking profile:', error);
          setIsProfileComplete(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  return isProfileComplete === false ? <Navigate to="/complete-profile" replace /> : <Navigate to="/dashboard" replace />;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => setLoading(false));
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          {/* Default Route: Home is now the landing page for everyone */}
          <Route path="/" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactUs /></MainLayout>} />
          
          {/* Auth/Redirection Logic */}
          <Route path="/check-profile" element={<AuthCheck />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <MainLayout><UserProfileForm /></MainLayout>
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><MainLayout><Leaderboard /></MainLayout></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><MainLayout><CreateEvent /></MainLayout></ProtectedRoute>} />
          <Route path="/manage-events" element={<ProtectedRoute><MainLayout><ManageEvents /></MainLayout></ProtectedRoute>} />
          <Route path="/form" element={<ProtectedRoute><MainLayout><UserProfileForm /></MainLayout></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute><MainLayout><Notification /></MainLayout></ProtectedRoute>} />
          
          {/* Event & Tournament Routes */}
          <Route path="/events/:id" element={<ProtectedRoute><MainLayout><EventDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id/participate" element={<ProtectedRoute><MainLayout><Participate /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id/create-team/" element={<ProtectedRoute><MainLayout><CreateTeam /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:eventId/matches/:matchId/edit" element={<ProtectedRoute><MainLayout><EditMatch /></MainLayout></ProtectedRoute>} />
          <Route path="/tournament-bracket" element={<ProtectedRoute><MainLayout><TournamentBracket /></MainLayout></ProtectedRoute>} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;