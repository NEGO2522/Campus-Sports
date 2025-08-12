import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const UpcomingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState({ open: false, eventId: null });
  const [saving, setSaving] = useState(false);
  const [participatingEvents, setParticipatingEvents] = useState({});

  const toggleEventDetails = (eventId) => {
    setShowDetails(showDetails === eventId ? null : eventId);
  };

  useEffect(() => {
    // Create a query against the collection
    const q = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );

    // Subscribe to query updates with error handling
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
      const now = new Date();
      const eventsData = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() };
        const eventDate = eventData.dateTime?.toDate ? eventData.dateTime.toDate() : new Date(eventData.dateTime);
        
        // Only include events that are in the future
        if (eventDate >= now) {
          eventsData.push({
            ...eventData,
            dateTime: eventDate // Ensure date is a Date object
          });
        }
      });
      
      // Sort by date (nearest first)
      eventsData.sort((a, b) => a.dateTime - b.dateTime);
      
      setEvents(eventsData);
      // Set participating status for each event for the current user
      const user = auth.currentUser;
      if (user) {
        const participationMap = {};
        eventsData.forEach(event => {
          let participated = false;
          // Check for individual participation
          if (Array.isArray(event.participants) && event.participants.includes(user.uid)) {
            participated = true;
          }
          // Check for team participation
          if (event.team && typeof event.team === 'object') {
            Object.values(event.team).forEach(team => {
              if (
                (Array.isArray(team.members) && team.members.includes(user.uid)) ||
                team.leader === user.uid
              ) {
                participated = true;
              }
            });
          }
          participationMap[event.id] = participated;
        });
        setParticipatingEvents(participationMap);
      } else {
        setParticipatingEvents({});
      }
      setLoading(false);
    }, 
    (error) => {
      console.error('Error getting events:', error);
      setEvents([]);
      setLoading(false);
      // You might want to show an error message to the user here
    },
    // Include metadata changes to ensure we get the most up-to-date data
    { includeMetadataChanges: true }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  
  const handleViewSchedule = (event) => {
    if (showDetails === event.id) {
      setShowDetails(null);
      return;
    }
    setShowDetails(event.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Loading upcoming events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {events.map((event, index) => {
        const isPlayersFull = event.participants?.length >= event.playersNeeded;
        const isTeamsFull = event.participationType === 'team' && 
                         Object.keys(event.team || {}).length >= event.teamsNeeded;
        const isFull = event.participationType === 'team' ? isTeamsFull : isPlayersFull;
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-blue-100 active:ring-blue-200"
            onClick={() => onEventClick && onEventClick(event)}
          >
            <div className="p-3 xs:p-4 sm:p-5">
              <div className="flex flex-col xs:flex-row justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base xs:text-lg font-semibold text-gray-900 truncate">{event.eventName}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                      event.sport?.toLowerCase() === 'football'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`} style={{ minWidth: '60px', justifyContent: 'center' }}>
                      {event.sport}
                      {event.location?.toLowerCase().includes('poornima') && (
                        <span className="ml-1 text-[8px] xs:text-[10px] bg-yellow-100 text-yellow-800 rounded-full px-1">Featured</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-col xs:flex-row xs:items-center text-xs xs:text-sm text-gray-500 gap-1.5">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1.5 h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0" />
                          <span className="font-medium block xs:hidden">Starts:</span>
                        </div>
                        <div className="mt-1 xs:mt-0">
                          <span className="font-medium hidden xs:inline mr-1">Starts:</span>
                          <span>
                            <span className="hidden xs:inline">{format(new Date(event.dateTime), 'EEEE, MMMM d')}</span>
                            <span className="xs:hidden">{format(new Date(event.dateTime), 'MMM d,')}</span>
                            <span className="mx-1.5">•</span>
                            {format(new Date(event.dateTime), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      {event.registrationDeadline && (
                        <div className="flex flex-col xs:flex-row xs:items-center text-gray-600 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaClock className="mr-1.5 h-3.5 w-3.5 xs:h-3.5 xs:w-3.5 flex-shrink-0" />
                            <span className="font-medium block xs:hidden">Register by:</span>
                          </div>
                          <div className="mt-1 xs:mt-0">
                            <span className="font-medium hidden xs:inline mr-1">Register by:</span>
                            <span>
                              {format(new Date(event.registrationDeadline), 'MMM d')}
                              <span className="mx-1.5">•</span>
                              {format(new Date(event.registrationDeadline), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs xs:text-sm text-gray-500">
                    <FaMapMarkerAlt className="mr-1.5 h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs xs:text-sm text-gray-500">
                    <FaUsers className="mr-1.5 h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0" />
                    {event.participationType === 'team' ? (
                      <span className={isTeamsFull ? 'text-red-600 font-medium' : ''}>
                        {Object.keys(event.team || {}).length} / {event.teamsNeeded || event.TeamsNeeded || 0} teams
                        {isTeamsFull && ' (Full)'}
                      </span>
                    ) : (
                      <span className={isPlayersFull ? 'text-red-600 font-medium' : ''}>
                        {event.participants?.length || 0} / {event.playersNeeded || event.PlayerNeeded || 0} players
                        {isPlayersFull && ' (Full)'}
                      </span>
                    )}
                  </div>
                  {/* Remove description from card, only show in details toggle */}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end mt-2 xs:mt-0">
                  <div className="flex flex-col items-end">
                  </div>
                </div>
              </div>
              <div className="mt-3 xs:mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSchedule(event);
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${showDetails === event.id ? 'bg-blue-100 text-blue-700' : ''}`}
                >
                  <FaClock className="mr-1.5 h-3 w-3" />
                  {showDetails === event.id ? 'Hide Details' : 'View Details'}
                </button>

                {event.participationType === 'player' ? (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setShowConfirm({ open: true, eventId: event.id });
                    }}
                    disabled={isFull || participatingEvents[event.id]}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                      isFull
                        ? 'bg-red-600 hover:bg-red-700'
                        : participatingEvents[event.id]
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isFull
                      ? 'Event Full'
                      : participatingEvents[event.id]
                        ? 'Participated'
                        : 'Participate'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (!participatingEvents[event.id]) {
                        navigate(`/events/${event.id}/participate`);
                      }
                    }}
                    disabled={isFull || participatingEvents[event.id]}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                      isFull
                        ? 'bg-red-600 hover:bg-red-700'
                        : participatingEvents[event.id]
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isFull
                      ? 'Event Full'
                      : participatingEvents[event.id]
                        ? 'Participated'
                        : 'Participate'}
                  </button>
                )}
              </div>

              {/* Details Section: Only show description in details toggle */}
              {showDetails === event.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Event Description</h4>
                  <p className="text-sm text-gray-700">{event.description || 'No description provided.'}</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    {/* Confirmation Overlay for player participation */}
    {showConfirm.open && (
      <div className="fixed inset-0 flex items-center justify-center bg-burr bg-opacity-40 backdrop-blur -sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Are you sure you want to participate?</h3>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                setSaving(true);
                try {
                  const user = auth.currentUser;
                  if (!user) {
                    alert('You must be logged in to participate.');
                    setSaving(false);
                    return;
                  }
                  const eventRef = doc(db, 'events', showConfirm.eventId);
                  await updateDoc(eventRef, {
                    participants: arrayUnion(user.uid)
                  });
                  setShowConfirm({ open: false, eventId: null });
                  setParticipatingEvents(prev => ({ ...prev, [showConfirm.eventId]: true }));
                } catch (error) {
                  alert('Failed to participate.');
                  console.error(error);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              Yes
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setShowConfirm({ open: false, eventId: null })}
              disabled={saving}
            >
              No
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default UpcomingEvents;