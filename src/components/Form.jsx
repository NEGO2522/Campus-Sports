import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaVenusMars, FaChevronLeft } from 'react-icons/fa';
import { GiTennisBall, GiSoccerBall, GiBasketballBasket, GiCricketBat, GiVolleyballBall } from 'react-icons/gi';

const sportsOptions = [
  { 
    id: 'football', 
    name: 'Football', 
    icon: <GiSoccerBall className="text-2xl" />,
    bg: 'hover:bg-green-500/10 border-green-500/50',
    selectedBg: 'bg-green-500/20 border-green-500',
    color: 'text-green-500'
  },
  { 
    id: 'basketball', 
    name: 'Basketball', 
    icon: <GiBasketballBasket className="text-2xl" />,
    bg: 'hover:bg-orange-500/10 border-orange-500/50',
    selectedBg: 'bg-orange-500/20 border-orange-500',
    color: 'text-orange-500'
  },
  { 
    id: 'cricket', 
    name: 'Cricket', 
    icon: <GiCricketBat className="text-2xl" />,
    bg: 'hover:bg-amber-500/10 border-amber-500/50',
    selectedBg: 'bg-amber-500/20 border-amber-500',
    color: 'text-amber-500'
  },
  { 
    id: 'badminton', 
    name: 'Badminton', 
    icon: <GiTennisBall className="text-2xl" />,
    bg: 'hover:bg-purple-500/10 border-purple-500/50',
    selectedBg: 'bg-purple-500/20 border-purple-500',
    color: 'text-purple-500'
  },
  { 
    id: 'volleyball', 
    name: 'Volleyball', 
    icon: <GiVolleyballBall className="text-2xl" />,
    bg: 'hover:bg-indigo-500/10 border-indigo-500/50',
    selectedBg: 'bg-indigo-500/20 border-indigo-500',
    color: 'text-indigo-500'
  },
  { 
    id: 'table_tennis', 
    name: 'Table Tennis', 
    icon: <GiTennisBall className="text-2xl" />,
    bg: 'hover:bg-yellow-500/10 border-yellow-500/50',
    selectedBg: 'bg-yellow-500/20 border-yellow-500',
    color: 'text-yellow-500'
  },
  { 
    id: 'swimming', 
    name: 'Swimming', 
    icon: '🏊',
    bg: 'hover:bg-blue-500/10 border-blue-500/50',
    selectedBg: 'bg-blue-500/20 border-blue-500',
    color: 'text-blue-500'
  },
];

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phoneNumber: '',
    experienceLevel: 'beginner',
    selectedSports: [],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
            age: userData.age || '',
            gender: userData.gender || '',
            phoneNumber: userData.phoneNumber || '',
            experienceLevel: userData.experienceLevel || 'beginner',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSport = (sport) => {
    setFormData(prev => {
      const isSelected = prev.selectedSports.some(s => s.id === sport.id);
      if (isSelected) {
        return {
          ...prev,
          selectedSports: prev.selectedSports.filter(s => s.id !== sport.id)
        };
      } else {
        if (prev.selectedSports.length >= 2) {
          setError('You can select up to 2 sports');
          return prev;
        }
        return {
          ...prev,
          selectedSports: [...prev.selectedSports, { id: sport.id, name: sport.name }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.selectedSports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        updatedAt: serverTimestamp(),
        profileCompleted: true,
      }, { merge: true });

      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {formData.fullName ? 'Edit Profile' : 'Complete Your Profile'}
              </h1>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
                >
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaVenusMars className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '8px 10px'
                    }}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Age"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Favorite Sports (Max 2)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {sportsOptions.map((sport) => {
                    const isSelected = formData.selectedSports.some(s => s.id === sport.id);
                    return (
                      <motion.div 
                        key={sport.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? `${sport.selectedBg} ${sport.color} border-2`
                            : `bg-white ${sport.bg} border-gray-200`
                        }`}
                        onClick={() => toggleSport(sport)}
                      >
                        <div className="flex flex-col items-center">
                          <span className={`text-2xl mb-1 ${isSelected ? sport.color : 'text-gray-600'}`}>
                            {sport.icon}
                          </span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {sport.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={level}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.experienceLevel === level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mr-3 ${
                          formData.experienceLevel === level
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.experienceLevel === level && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="capitalize">{level}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg text-white font-medium text-lg transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfileForm;