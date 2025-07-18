import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaArrowRight, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { GiSoccerBall, GiBasketballBasket, GiTennisBall, GiVolleyballBall, GiCricketBat } from 'react-icons/gi';
import { signInWithGoogle, signInWithEmailLinkAuth, completeEmailLinkSignIn, checkAuthState } from '../firebase/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  // Match the hero images from Home.jsx
  const backgroundImages = [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195efe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80'
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

  // Check if we're handling an email link sign-in
  useEffect(() => {
    if (location.search.includes('oobCode=')) {
      handleEmailLinkSignIn();
    }
  }, [location]);

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = checkAuthState((user) => {
      if (user) {
        navigate('/dashboard'); // Redirect to dashboard if already logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      const { user, error: googleError } = await signInWithGoogle();
      if (googleError) throw new Error(googleError);
      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsEmailLoading(true);
      setError('');
      const { success, error: emailError } = await signInWithEmailLinkAuth(email);
      if (emailError) throw new Error(emailError);
      if (success) {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send sign-in link');
    } finally {
      setIsEmailLoading(false);
    }
  };

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
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
          
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GiSoccerBall className="text-3xl text-white" />
              </div>
            </div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Sign in to your Campus Sports account
            </motion.p>
          </div>

          {emailSent ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isEmailLoading}
                  className={`w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-gray-600/50 rounded-xl py-3.5 px-6 text-white transition-all duration-300 group ${
                    isGoogleLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isGoogleLoading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    <FcGoogle className="text-xl" />
                  )}
                  <span className="font-medium">
                    {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                  </span>
                </motion.button>

                <div className="relative flex items-center my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
                  <span className="px-4 text-sm text-gray-400">or continue with email</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
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
                </motion.div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isEmailLoading || isGoogleLoading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3.5 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isEmailLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEmailLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Sending link...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Email</span>
                        <FaArrowRight />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
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