import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { motion } from 'framer-motion';
import { FaEdit, FaUser, FaPhone, FaVenusMars, FaBirthdayCake, FaStar, FaChevronLeft } from 'react-icons/fa';
import { GiSoccerBall, GiBasketballBasket, GiCricketBat, GiVolleyballBall, GiTennisBall } from 'react-icons/gi';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    // Set up real-time listener for user data
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          // If no profile exists, redirect to complete profile
          navigate('/complete-profile');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to user data:', error);
        setLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Sport options with their display names, icons and colors
  const sportOptions = {
    football: { 
      name: 'Football',
      icon: <GiSoccerBall className="text-2xl" />, 
      color: 'text-green-500' 
    },
    basketball: { 
      name: 'Basketball',
      icon: <GiBasketballBasket className="text-2xl" />, 
      color: 'text-orange-500' 
    },
    cricket: { 
      name: 'Cricket',
      icon: <GiCricketBat className="text-2xl" />, 
      color: 'text-amber-500' 
    },
    badminton: { 
      name: 'Badminton',
      icon: <GiTennisBall className="text-2xl" />, 
      color: 'text-purple-500' 
    },
    volleyball: { 
      name: 'Volleyball',
      icon: <GiVolleyballBall className="text-2xl" />, 
      color: 'text-indigo-500' 
    },
    table_tennis: { 
      name: 'Table Tennis',
      icon: <GiTennisBall className="text-2xl" />, 
      color: 'text-yellow-500' 
    },
    swimming: { 
      name: 'Swimming',
      icon: '🏊', 
      color: 'text-blue-500' 
    }
  };

  // Get sport details by ID
  const getSportDetails = (sportId) => {
    return sportOptions[sportId] || { 
      name: sportId, // Fallback to ID if not found
      icon: '🏅', 
      color: 'text-gray-500' 
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors mr-4"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg flex items-center justify-center text-4xl sm:text-5xl font-bold text-white">
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : '👤'}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">
                {userData.fullName || 'User'}
              </h1>
              {userData.experienceLevel && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                  <FaStar className="mr-1 text-yellow-500" />
                  {userData.experienceLevel.charAt(0).toUpperCase() + userData.experienceLevel.slice(1)} Level
                </span>
              )}
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaVenusMars className="text-gray-400 mt-0.5 mr-3 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                      <p className="font-medium text-sm sm:text-base">
                        {userData.gender || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaBirthdayCake className="text-gray-400 mt-0.5 mr-3 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Age</p>
                      <p className="font-medium text-sm sm:text-base">
                        {userData.age ? `${userData.age} years` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="text-gray-400 mt-0.5 mr-3 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-sm sm:text-base">
                        {userData.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sports Interests */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                  Sports Interests
                </h2>
                {userData.selectedSports && userData.selectedSports.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userData.selectedSports.map((sport, index) => {
                      const sportDetails = getSportDetails(sport.id || sport);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${sportDetails.color} bg-opacity-20`}
                        >
                          <span className="mr-1.5">{sportDetails.icon}</span>
                          <span>{sportDetails.name}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sports interests selected</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {userData.bio && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  About
                </h2>
                <p className="text-sm sm:text-base text-gray-700">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* Edit Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate('/complete-profile')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;