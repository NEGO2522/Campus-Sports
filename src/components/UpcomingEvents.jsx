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
  const [showSchedule, setShowSchedule] = useState(null);
  const [eventSchedule, setEventSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState({ open: false, eventId: null });
  const [saving, setSaving] = useState(false);
  const [participatingEvents, setParticipatingEvents] = useState({});

  useEffect(() => {
    // Create a query against the collection
    const q = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );

    // Subscribe to query updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    }, (error) => {
      console.error('Error getting events:', error);
      setEvents([]);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  
  const handleViewSchedule = (event) => {
    if (showSchedule === event.id) {
      setShowSchedule(null);
      return;
    }
    setShowSchedule(event.id);
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
    <div className="space-y-4">
      {events.map((event, index) => {
        const isFull = event.participants?.length >= event.playersNeeded;
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-blue-100 active:ring-blue-200"
            onClick={() => onEventClick && onEventClick(event)}
          >
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.eventName}</h3>
                  <div className="mt-1 flex items-center text-sm justify-between">
                    <div className="flex items-center text-gray-500">
                      <FaCalendarAlt className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Event Starts:</span>
                      <span className="ml-1">{format(new Date(event.dateTime), 'EEEE, MMMM d, yyyy')}</span>
                      <span className="mx-2">•</span>
                      <span>{format(new Date(event.dateTime), 'h:mm a')}</span>
                    </div>
                    
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    {event.participationType === 'team' ? (
                      <span>{event.participants?.length || 0} / {event.teamsNeeded || event.TeamsNeeded || 0} teams</span>
                    ) : (
                      <span>{event.participants?.length || 0} / {event.playersNeeded || event.PlayerNeeded || 0} players</span>
                    )}
                  </div>
                  {/* Remove description from card, only show in details toggle */}
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.sport?.toLowerCase() === 'football' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  } mb-2`}>
                    {event.sport}
                    {event.location?.toLowerCase().includes('poornima') && (
                      <span className="ml-1 text-[10px] bg-yellow-100 text-yellow-800 rounded-full px-1.5">Featured</span>
                    )}
                  </span>
                  {event.registrationDeadline && (
                      <div className="flex items-center text-sm mt-3 text-gray-600 ml-4 whitespace-nowrap">
                        <FaClock className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">Register by:</span>
                        <span className="ml-1">{format(new Date(event.registrationDeadline), 'MMM d, yyyy')}</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(event.registrationDeadline), 'h:mm a')}</span>
                      </div>
                    )}
                                  </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSchedule(event);
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${showSchedule === event.id ? 'bg-blue-100 text-blue-700' : ''}`}
                >
                  <FaClock className="mr-1.5 h-3 w-3" />
                  {showSchedule === event.id ? 'Hide Details' : 'View Details'}
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
              {showSchedule === event.id && (
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
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
              {saving ? 'Saving...' : 'Yes'}
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
