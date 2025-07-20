import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarPlus, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaChevronDown, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { logActivity, ACTIVITY_TYPES } from '../../utils/activityLogger';
import { db, auth } from '../../firebase/firebase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CreateEvent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      await deleteDoc(doc(db, 'events', eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const [formData, setFormData] = useState({
    eventName: '',
    sport: '',
    dateTime: '',
    location: '',
    description: '',
    playersNeeded: 10,
    createdBy: '',
    createdAt: null,
    participants: [],
    status: 'upcoming'
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowForm(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Fetch user's events
    if (auth.currentUser) {
      const q = query(
        collection(db, 'events'),
        where('createdBy', '==', auth.currentUser.uid),
        where('status', '==', 'upcoming'),
        orderBy('dateTime')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const events = [];
        querySnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
        setUserEvents(events);
        setLoadingEvents(false);
      }, (error) => {
        console.error('Error getting user events:', error);
        setLoadingEvents(false);
      });

      return () => {
        window.removeEventListener('resize', handleResize);
        unsubscribe();
      };
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleForm = () => setShowForm(!showForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'playersNeeded' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.eventName || !formData.sport || !formData.dateTime || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('You must be logged in to create an event');
      }

      const eventData = {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        participants: [user.uid], // Add creator as first participant
        status: 'upcoming'
      };

      // Add a new document with a generated ID
      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      toast.success('Event created successfully!');
      
      // Log the activity
      await logActivity({
        type: ACTIVITY_TYPES.EVENT_CREATED,
        eventId: docRef.id,
        eventName: eventData.eventName,
        eventType: eventData.sport,
        eventLocation: eventData.location,
        message: `Created a new ${eventData.sport} event: ${eventData.eventName}`,
        isPublic: true
      });
      
      setFormData({
        eventName: '',
        sport: '',
        dateTime: '',
        location: '',
        description: '',
        playersNeeded: 10,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        participants: [user.uid],
        status: 'upcoming'
      });
      
      console.log('Event created with ID: ', docRef.id);
      
    } catch (error) {
      console.error('Error creating event: ', error);
      toast.error(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUserEvents = () => {
    if (loadingEvents) {
      return (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (userEvents.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any upcoming events yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {userEvents.map((event) => (
          <div key={event.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900">{event.eventName}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                    disabled={deletingEventId === event.id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete event"
                  >
                    {deletingEventId === event.id ? (
                      <FaSpinner className="animate-spin h-4 w-4" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <FaCalendarAlt className="mr-1.5 h-3 w-3 flex-shrink-0" />
                  <span>{format(new Date(event.dateTime), 'EEE, h:mm a')}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500 truncate">
                  <FaMapMarkerAlt className="inline mr-1 h-3 w-3" />
                  {event.location}
                </p>
              </div>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                {event.participants?.length || 0}/{event.playersNeeded} players
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
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
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                        <input 
                          type="text" 
                          name="eventName"
                          value={formData.eventName}
                          onChange={handleInputChange}
                          className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Weekend Football Match"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
                        <select 
                          name="sport"
                          value={formData.sport}
                          onChange={handleInputChange}
                          className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a sport</option>
                          <option value="Football">Football</option>
                          <option value="Basketball">Basketball</option>
                          <option value="Tennis">Tennis</option>
                          <option value="Badminton">Badminton</option>
                          <option value="Cricket">Cricket</option>
                          <option value="Volleyball">Volleyball</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                        <input 
                          type="datetime-local" 
                          name="dateTime"
                          value={formData.dateTime}
                          onChange={handleInputChange}
                          className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="pl-9 sm:pl-10 w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter location or venue"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
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
                            name="playersNeeded"
                            value={formData.playersNeeded}
                            onChange={handleInputChange}
                            min="2"
                            max="50"
                            className="w-16 sm:w-20 text-sm sm:text-base px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
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
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Creating...
                            </>
                          ) : 'Create Event'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
              </motion.div>
            </div>
            
            {/* User's Upcoming Events */}
            <div className="xl:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-5 sticky top-6 h-fit w-full"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Upcoming Events</h2>
                {renderUserEvents()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
