import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaSpinner, FaPlay, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ManageEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [startingEventId, setStartingEventId] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  useEffect(() => {
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
        setUpcomingEvents(events);
        setLoadingEvents(false);
      }, (error) => {
        console.error('Error getting upcoming events:', error);
        setLoadingEvents(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleStartTournament = async (eventId) => {
    if (!window.confirm('Are you sure you want to start this tournament? This will change its status to ongoing.')) {
      return;
    }

    try {
      setStartingEventId(eventId);
      await updateDoc(doc(db, 'events', eventId), {
        status: 'ongoing'
      });
      toast.success('Tournament started successfully!');
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast.error('Failed to start tournament');
    } finally {
      setStartingEventId(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
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

  const renderUpcomingEvents = () => {
    if (loadingEvents) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (upcomingEvents.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
          <p className="text-gray-500">You don't have any upcoming tournaments to manage yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {event.eventName}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.sport}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-400" />
                  {format(new Date(event.dateTime), 'MMM dd, yyyy • h:mm a')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-2 h-4 w-4 text-gray-400" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaUsers className="mr-2 h-4 w-4 text-gray-400" />
                  {event.participationType === 'team' ? (
                    <span>{event.participants?.length || 0} / {event.teamsNeeded || event.TeamsNeeded || 0} teams</span>
                  ) : (
                    <span>{event.participants?.length || 0} / {event.playersNeeded || event.PlayerNeeded || 0} players</span>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartTournament(event.id)}
                    disabled={startingEventId === event.id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Start Tournament"
                  >
                    {startingEventId === event.id ? (
                      <FaSpinner className="animate-spin h-3 w-3" />
                    ) : (
                      <FaPlay className="h-3 w-3" />
                    )}
                    <span className="ml-1 hidden sm:inline">Start</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Edit Event"
                  >
                    <FaEdit className="h-3 w-3" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={deletingEventId === event.id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Event"
                  >
                    {deletingEventId === event.id ? (
                      <FaSpinner className="animate-spin h-3 w-3" />
                    ) : (
                      <FaTrash className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <FaCog className="mr-3 text-blue-500" />
              Manage Events
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your upcoming tournaments and start them when ready
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong> Your upcoming events are listed below. When you're ready to begin a tournament, 
                click the "Start" button to change its status to ongoing. Participants will then be able to see it as a live event.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {renderUpcomingEvents()}
      </motion.div>
    </div>
  );
};

export default ManageEvents;
