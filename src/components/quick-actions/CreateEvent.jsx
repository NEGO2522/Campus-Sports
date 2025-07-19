import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarPlus, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaPlus, FaChevronDown } from 'react-icons/fa';

const CreateEvent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowForm(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleForm = () => setShowForm(!showForm);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <FaCalendarPlus className="mr-2 sm:mr-3 text-blue-500" />
            Create New Event
          </h1>
          {isMobile && (
            <button 
              onClick={toggleForm}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaChevronDown className={`w-5 h-5 transition-transform ${showForm ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {(showForm || !isMobile) && (
            <motion.div 
              initial={isMobile ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                    <input 
                      type="text" 
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Weekend Football Match"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                    <select className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select a sport</option>
                      <option>Football</option>
                      <option>Basketball</option>
                      <option>Tennis</option>
                      <option>Badminton</option>
                      <option>Cricket</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="pl-9 sm:pl-10 w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter location or venue"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows="4"
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell participants about the event..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Players Needed</label>
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                      <input 
                        type="number" 
                        min="2"
                        max="50"
                        className="w-16 sm:w-20 text-sm sm:text-base px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="10"
                      />
                      <span className="text-xs sm:text-sm text-gray-500">players</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <div className="flex">
                      <FaInfoCircle className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mt-0.5" />
                      <div className="ml-2 sm:ml-3">
                        <h3 className="text-xs sm:text-sm font-medium text-blue-800">Pro Tip</h3>
                        <div className="mt-0.5 text-xs sm:text-sm text-blue-700">
                          <p>Be specific about the skill level and any equipment needed for the best match.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-1 sm:pt-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base">
                      Create Event
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Upcoming Events</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base truncate">Weekend Football Match</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Sat, 10:00 AM - 12:00 PM</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">City Sports Complex</p>
              </div>
              <span className="ml-2 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                8/10 players
              </span>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base truncate">Evening Basketball</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Mon, 6:00 PM - 8:00 PM</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Downtown Court</p>
              </div>
              <span className="ml-2 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">
                3/10 players
              </span>
            </div>
          </div>
          
          {isMobile && (
            <button 
              onClick={toggleForm}
              className="w-full mt-2 flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {showForm ? 'Hide Form' : 'Create New Event'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEvent;
