import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaArrowRight, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { GiSoccerBall } from 'react-icons/gi';
import { signInWithEmailLinkAuth, completeEmailLinkSignIn, checkAuthState } from '../firebase/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  // Background images
  const backgroundImages = [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195efe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80',
  ];

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle email link sign-in
  const handleEmailLinkSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { user, error: signInError } = await completeEmailLinkSignIn(email, window.location.href);
      if (signInError) throw new Error(signInError);
      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with email link');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e, role = 'player') => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      localStorage.setItem('userRole', role);
      const { success, error: emailError } = await signInWithEmailLinkAuth(email);
      if (emailError) throw new Error(emailError);
      if (success) {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send sign-in link');
      localStorage.removeItem('userRole');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we're handling an email link sign-in
  useEffect(() => {
    if (location.search.includes('oobCode=')) {
      handleEmailLinkSignIn();
    }
  }, [location]);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = checkAuthState((user) => {
      if (user) {
        const userRole = localStorage.getItem('userRole') || 'player';
        sessionStorage.setItem('userRole', userRole);
        localStorage.removeItem('userRole');
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-900" ref={containerRef}>
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src={backgroundImages[currentImageIndex]}
              alt={`Background ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/90 to-gray-900/95 backdrop-blur-sm" />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
            <p className="text-white font-medium">Signing you in...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl p-8 shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GiSoccerBall className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300 text-sm">
              Sign in to your Campus Sports account
            </p>
          </div>

          {emailSent ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-2xl mb-2 text-green-400">✓</div>
              <h3 className="text-xl font-medium text-white mb-2">Check your email</h3>
              <p className="text-gray-300 mb-6">We've sent a login link to {email}</p>
              <button 
                onClick={() => setEmailSent(false)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Back to login
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-700/30 border border-gray-600/50 hover:border-blue-500/50 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white placeholder-gray-400 text-sm transition-all duration-300"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Organizer Login */}
                  <motion.button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'organizer')}
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !email}
                    className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isLoading || !email ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>Login as Organizer</span>
                    <FaArrowRight />
                  </motion.button>

                  {/* Player Login */}
                  <motion.button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'player')}
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !email}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3.5 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isLoading || !email ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>Login as Player</span>
                    <FaArrowRight />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

export default Login;
