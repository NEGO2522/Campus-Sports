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
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Scroll reset on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="w-full"><Navbar /></header>
    <main className="flex-1 w-full">{children}</main>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ccff00]"></div>
  </div>
);

function App() {
  // Auth state will come from our own backend JWT stored in localStorage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Verify JWT token with backend on app load
    // const token = localStorage.getItem('cl_token');
    // if (token) { api.get('/auth/me').then(...).catch(() => localStorage.removeItem('cl_token')); }
    setLoading(false);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactUs /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
          <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />

          <Route path="/complete-profile" element={
            <ProtectedRoute><MainLayout><UserProfileForm /></MainLayout></ProtectedRoute>
          } />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><MainLayout><Leaderboard /></MainLayout></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><MainLayout><CreateEvent /></MainLayout></ProtectedRoute>} />
          <Route path="/manage-events" element={<ProtectedRoute><MainLayout><ManageEvents /></MainLayout></ProtectedRoute>} />
          <Route path="/form" element={<ProtectedRoute><MainLayout><UserProfileForm /></MainLayout></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute><MainLayout><Notification /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><MainLayout><EventDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id/participate" element={<ProtectedRoute><MainLayout><Participate /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id/create-team/" element={<ProtectedRoute><MainLayout><CreateTeam /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:eventId/matches/:matchId/edit" element={<ProtectedRoute><MainLayout><EditMatch /></MainLayout></ProtectedRoute>} />
          <Route path="/tournament-bracket" element={<ProtectedRoute><MainLayout><TournamentBracket /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
