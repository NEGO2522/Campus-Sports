import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCheck, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const UpcomingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participatingEvents, setParticipatingEvents] = useState({});
  const [showSchedule, setShowSchedule] = useState(null);
  const [eventSchedule, setEventSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

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
      setLoading(false);
    }, (error) => {
      console.error('Error getting events:', error);
      setEvents([]);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Check if current user is participating in each event
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // If user is not logged in, clear all participation statuses
      setParticipatingEvents({});
      return;
    }

    const updatedParticipating = {};
    const now = new Date();
    
    events.forEach(event => {
      // Only set participation status for future events
      const eventDate = event.dateTime?.toDate ? event.dateTime.toDate() : new Date(event.dateTime);
      if (eventDate >= now) {
        updatedParticipating[event.id] = event.participants?.includes(user.uid) || false;
      }
    });
    
    setParticipatingEvents(updatedParticipating);
  }, [events]);

  const handleParticipate = async (eventId) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please log in to participate in events');
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();
      
      // Update the event with the new participant
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      });
      
      // Log the participation activity
      await logActivity({
        type: ACTIVITY_TYPES.EVENT_JOINED,
        eventId,
        eventName: eventData.eventName,
        eventType: eventData.sport,
        eventLocation: eventData.location,
        message: `Joined ${eventData.sport} event: ${eventData.eventName}`,
        isPublic: true
      });
      
      // Update local state to reflect participation
      setParticipatingEvents(prev => ({
        ...prev,
        [eventId]: true
      }));
      
      toast.success('Successfully joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event. Please try again.');
    }
  };

  const handleViewSchedule = async (event) => {
    setShowSchedule(event.id);
    setScheduleLoading(true);
    
    try {
      // In a real app, you would fetch the actual schedule from Firestore
      // For now, we'll use a mock schedule
      const mockSchedule = {
        date: event.dateTime,
        location: event.location,
        duration: '2 hours',
        organizer: event.createdBy || 'Event Organizer',
        participants: event.participants?.length || 0,
        maxParticipants: event.playersNeeded || 10,
        description: event.description || 'No additional details provided.'
      };
      
      setEventSchedule(mockSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load event schedule');
    } finally {
      setScheduleLoading(false);
    }
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
        const isParticipating = participatingEvents[event.id];
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
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  )}
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
                  {isParticipating && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheck className="mr-1" /> Participating
                    </span>
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
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaClock className="mr-1.5 h-3 w-3" />
                  View Schedule
                </button>
                <button
                  type="button"
                  onClick={(e) => {
              e.stopPropagation();
              handleParticipate(event.id);
            }}
                  disabled={isParticipating || isFull}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                    isParticipating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isFull 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isParticipating ? 'Participated' : isFull ? 'Event Full' : 'Participate'}
                </button>
              </div>

              {/* Schedule/Timetable Section */}
              {showSchedule === event.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Event Schedule</h4>
                  {scheduleLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : eventSchedule ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(eventSchedule.date), 'EEEE, MMMM d, yyyy')} at {format(new Date(eventSchedule.date), 'h:mm a')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{eventSchedule.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">{eventSchedule.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Participants</p>
                          <p className="text-sm font-medium text-gray-900">
                            {eventSchedule.participants} / {eventSchedule.maxParticipants} players
                          </p>
                        </div>
                      </div>
                      {eventSchedule.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">Additional Details</p>
                          <p className="text-sm text-gray-700">{eventSchedule.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No schedule details available.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UpcomingEvents;
