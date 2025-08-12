import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaArrowRight, FaSpinner, FaGoogle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { GiSoccerBall } from 'react-icons/gi';
import { signInWithEmailLinkAuth, signInWithGoogle, completeEmailLinkSignIn } from '../firebase/firebase';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { isProfileComplete } from '../utils/profileUtils';

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

  // Check profile status and redirect
  const checkAndRedirect = async (user) => {
    try {
      const profileComplete = await isProfileComplete(user.uid);
      if (profileComplete) {
        navigate(location.state?.from?.pathname || '/dashboard');
      } else {
        navigate('/form');
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      navigate('/form');
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const { user, error: googleError } = await signInWithGoogle();
      if (googleError) throw new Error(googleError);
      if (user) {
        await checkAndRedirect(user);
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for email link in URL
  useEffect(() => {
    const verifyEmailLink = async () => {
      if (window.location.href.includes('mode=signIn') || 
          window.location.href.includes('__/auth/action')) {
        try {
          setIsLoading(true);
          const { user, error } = await completeEmailLinkSignIn(email, window.location.href);
          if (error) throw new Error(error);
          if (user) {
            await checkAndRedirect(user);
          }
        } catch (err) {
          setError(err.message || 'Failed to complete sign in with email link');
          setIsLoading(false);
        }
      }
    };

    verifyEmailLink();
  }, []);

  // Handle email link sign in
  const handleEmailLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const { success, error: emailError } = await signInWithEmailLinkAuth(email);
      if (emailError) throw new Error(emailError);
      if (success) {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send sign-in link');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden bg-gray-900" ref={containerRef}>
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
      <div className="relative z-10 w-full max-w-md px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GiSoccerBall className="text-4xl text-blue-400 mr-2" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Campus Leauge
              </h1>
            </div>
            <p className="text-gray-300 text-sm sm:text-base">
              Join the ultimate sports community on campus
            </p>
          </div>

          {!emailSent ? (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="mr-3 text-red-400" />
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-400">Or</span>
                </div>
              </div>

              <form onSubmit={handleEmailLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm p-3 bg-red-900/30 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaEnvelope className="mr-2" />
                  )}
                  Send Email Link
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 mb-4">
                <FaEnvelope className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Check your email</h3>
              <p className="text-gray-300 text-sm mb-6">
                We've sent a sign-in link to <span className="font-medium text-white">{email}</span>.
                Click the link to access your account.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Back to login
              </button>
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