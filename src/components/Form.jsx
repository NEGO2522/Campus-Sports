import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaVenusMars, FaChevronLeft, FaSwimmer, FaEnvelope } from 'react-icons/fa';
import { GiSoccerBall, GiBasketballBasket, GiCricketBat, GiTennisBall, GiVolleyballBall, GiTennisRacket } from 'react-icons/gi';

const sportsOptions = [
  { 
    id: 'football', 
    name: 'Football', 
    icon: <GiSoccerBall className="text-3xl" />,
    bg: 'hover:bg-green-500/10 hover:border-green-500/70',
    selectedBg: 'bg-gradient-to-br from-green-500/90 to-emerald-500/90 border-transparent',
    color: 'text-green-500',
    shadow: 'shadow-green-500/20'
  },
  { 
    id: 'basketball', 
    name: 'Basketball', 
    icon: <GiBasketballBasket className="text-3xl" />,
    bg: 'hover:bg-orange-500/10 hover:border-orange-500/70',
    selectedBg: 'bg-gradient-to-br from-orange-500/90 to-amber-500/90 border-transparent',
    color: 'text-orange-500',
    shadow: 'shadow-orange-500/20'
  },
  { 
    id: 'cricket', 
    name: 'Cricket', 
    icon: <GiCricketBat className="text-3xl" />,
    bg: 'hover:bg-amber-500/10 hover:border-amber-500/70',
    selectedBg: 'bg-gradient-to-br from-amber-500/90 to-yellow-500/90 border-transparent',
    color: 'text-amber-500',
    shadow: 'shadow-amber-500/20'
  },
  { 
    id: 'badminton', 
    name: 'Badminton', 
    icon: <GiTennisRacket className="text-3xl" />,
    bg: 'hover:bg-purple-500/10 hover:border-purple-500/70',
    selectedBg: 'bg-gradient-to-br from-purple-500/90 to-fuchsia-500/90 border-transparent',
    color: 'text-purple-500',
    shadow: 'shadow-purple-500/20'
  },
  { 
    id: 'volleyball', 
    name: 'Volleyball', 
    icon: <GiVolleyballBall className="text-3xl" />,
    bg: 'hover:bg-indigo-500/10 hover:border-indigo-500/70',
    selectedBg: 'bg-gradient-to-br from-indigo-500/90 to-blue-500/90 border-transparent',
    color: 'text-indigo-500',
    shadow: 'shadow-indigo-500/20'
  },
  { 
    id: 'table_tennis', 
    name: 'Table Tennis', 
    icon: <GiTennisRacket className="text-3xl" />,
    bg: 'hover:bg-rose-500/10 hover:border-rose-500/70',
    selectedBg: 'bg-gradient-to-br from-rose-500/90 to-pink-500/90 border-transparent',
    color: 'text-rose-500',
    shadow: 'shadow-rose-500/20'
  },

];

const UserProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    courseName: '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: auth.currentUser?.email || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data if editing profile
  useEffect(() => {
    const loadUserData = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            fullName: userData.fullName || '',
            registrationNumber: userData.registrationNumber || '',
            courseName: userData.courseName || '',
            age: userData.age || '',
            gender: userData.gender || '',
            phoneNumber: userData.phoneNumber || '',
            email: auth.currentUser?.email || '',
            selectedSports: userData.selectedSports || [],
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!auth.currentUser) {
        toast.error('You must be logged in to complete your profile');
        navigate('/login', { state: { from: location } });
        return;
      }

      // Validation
      if (!formData.fullName) {
        setError('Full name is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.registrationNumber) {
        setError('Registration number is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.courseName) {
        setError('Course name is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.phoneNumber) {
        setError('Phone number is required');
        setIsSubmitting(false);
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Check if this is a new profile or an update
      const userDoc = await getDoc(userRef);
      const isNewProfile = !userDoc.exists();

      const userData = {
        ...formData,
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        profileCompleted: true,
        updatedAt: serverTimestamp()
      };

      // Only set createdAt for new profiles
      if (isNewProfile) {
        userData.createdAt = serverTimestamp();
      }

      // First update the user document with profile completion status
      await setDoc(userRef, { ...userData, profileCompleted: true }, { merge: true });
      
      console.log('Profile saved successfully:', userData);
      
      // Update local storage to indicate profile is complete
      localStorage.setItem('profileCompleted', 'true');
      
      // Show success message
      toast.success('Profile saved successfully!');
      
      // Redirect to dashboard immediately with state to prevent redirect loop
      navigate('/dashboard', { 
        replace: true,
        state: { from: { pathname: '/complete-profile', state: { from: location } } } 
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GiSoccerBall className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-slate-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl">
          <div className="p-8 sm:p-12">
            <div className="flex items-start mb-12">
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 mr-4 transition-all duration-300 text-gray-600 hover:text-gray-900"
              >
                <FaChevronLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.fullName ? 'Edit Profile' : 'Complete Your Profile'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {formData.fullName ? 'Update your profile information' : 'Tell us more about yourself'}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg"
                >
                  <p className="text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email field (read-only) */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaEnvelope className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 cursor-not-allowed"
                    placeholder="Email"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaUser className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Full Name"
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaPhone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Phone Number"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaUser className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Registration Number"
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaUser className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Course Name"
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FaVenusMars className="h-5 w-5" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  >
                    <option value="" className="bg-white text-gray-800">Select Gender</option>
                    <option value="male" className="bg-white text-gray-800">Male</option>
                    <option value="female" className="bg-white text-gray-800">Female</option>
                    <option value="other" className="bg-white text-gray-800">Other</option>
                    <option value="prefer-not-to-say" className="bg-white text-gray-800">Prefer not to say</option>
                  </select>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative"
                >
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Your Age"
                    required
                  />
                </motion.div>
              </div>

              {/* Experience Level removed as requested */}

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)' } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-blue-500/70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Profile'}
                </motion.button>
              </motion.div>

              {/* Sign Out Button */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 flex items-center justify-center w-full py-2 px-4 rounded-lg hover:bg-red-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;