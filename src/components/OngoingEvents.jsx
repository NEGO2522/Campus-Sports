import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCheck, FaClock, FaPlay, FaSpinner, FaChevronDown, FaChevronUp, FaTrophy, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

const OngoingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [matchesByEvent, setMatchesByEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [participatingEvents, setParticipatingEvents] = useState({});
  const [showSchedule, setShowSchedule] = useState(null);
  const [eventSchedule, setEventSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isFootballExpanded, setIsFootballExpanded] = useState(true);

  useEffect(() => {
    // Fetch all ongoing events, then fetch matches for each event
    const fetchOngoingEventsAndMatches = async () => {
      setLoading(true);
      try {
        const eventsSnap = await getDocs(query(collection(db, 'events'), where('status', '==', 'ongoing')));
        const eventsArr = eventsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setEvents(eventsArr);

        // Fetch matches for each event
        const matchesObj = {};
        for (const event of eventsArr) {
          const matchesSnap = await getDocs(collection(db, 'events', event.id, 'matches'));
          matchesObj[event.id] = matchesSnap.docs.map(matchDoc => {
            const match = matchDoc.data();
            let dateTime = match.dateTime;
            if (dateTime && typeof dateTime.toDate === 'function') {
              dateTime = dateTime.toDate();
            } else if (dateTime) {
              dateTime = new Date(dateTime);
            }
            return {
              id: matchDoc.id,
              matchName: match.round || match.matchName || match.title || '',
              team1: { name: match.team1 },
              team2: { name: match.team2 },
              location: match.location,
              dateTime,
              description: match.description || '',
            };
          });
        }
        setMatchesByEvent(matchesObj);
      } catch (err) {
        setEvents([]);
        setMatchesByEvent({});
      } finally {
        setLoading(false);
      }
    };
    fetchOngoingEventsAndMatches();
  }, []);

  // Check if current user is participating in each event
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setParticipatingEvents({});
      return;
    }
    const updatedParticipating = {};
    events.forEach(event => {
      updatedParticipating[event.id] = event.participants?.includes(user.uid) || false;
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
        message: `Joined ongoing ${eventData.sport} event: ${eventData.eventName}`,
        isPublic: true
      });
      
      // Update local state to reflect participation
      setParticipatingEvents(prev => ({
        ...prev,
        [eventId]: true
      }));
      
      toast.success('Successfully joined the ongoing event!');
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event. Please try again.');
    }
  };

  const handleViewSchedule = async (event) => {
    setShowSchedule(event.id);
    setScheduleLoading(true);
    
    try {
      // Calculate how long the event has been running
      const now = new Date();
      const eventStart = event.dateTime;
      const minutesElapsed = differenceInMinutes(now, eventStart);
      const hoursElapsed = differenceInHours(now, eventStart);
      const daysElapsed = differenceInDays(now, eventStart);
      
      let elapsedTime = '';
      if (daysElapsed > 0) {
        elapsedTime = `${daysElapsed}d ago`;
      } else if (minutesElapsed >= 60) {
        elapsedTime = `${hoursElapsed}h ago`;
      } else {
        elapsedTime = `${minutesElapsed}m ago`;
      }

      const mockSchedule = {
        date: event.dateTime,
        location: event.location,
        duration: '2 hours (estimated)',
        organizer: event.createdBy || 'Event Organizer',
        participants: event.participants?.length || 0,
        maxParticipants: event.playersNeeded || 10,
        description: event.description || 'No additional details provided.',
        status: 'Currently in progress',
        startedTime: elapsedTime
      };
      
      setEventSchedule(mockSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load event schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  // Helper function to calculate elapsed time
  const getElapsedTime = (startDate) => {
    const now = new Date();
    const minutesElapsed = differenceInMinutes(now, startDate);
    const daysElapsed = differenceInDays(now, startDate);
    
    if (daysElapsed > 0) {
      return `${daysElapsed}d ago`;
    } else if (minutesElapsed >= 60) {
      const hours = (minutesElapsed / 60).toFixed(1).replace(/\.0$/, '');
      return `${hours}h ago`;
    } else {
      return `${minutesElapsed}m ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (events.length === 0) {  
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Ongoing Events</h3>
        <p className="text-gray-500">There are currently no ongoing tournaments or events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-gray-100 active:ring-gray-200"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900 text-base">
                          {event.eventName || event.title || 'Event'}
                        </div>
                        <div className="text-xs text-gray-500">{event.sport}</div>
                      </div>
                      
                      
                      <div className="mt-2">
                        {matchesByEvent[event.id] && matchesByEvent[event.id].length > 0 ? (
                          matchesByEvent[event.id].map((match) => (
                            <div key={match.id} className="mb-2">
                              {match.matchName && (
                                <div className="font-bold text-orange-600 text-sm mb-1">{match.matchName}</div>
                              )}
                              <div className="p-3 bg-white rounded border border-green-300">
                                <div className="text-lg text-black font-medium mt-1 mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>{(match.team1?.name || match.team1) || 'Team 1'}</div>
                                    {match.dateTime && (
                                      <div className="text-xs text-gray-700 ml-4 whitespace-nowrap">{format(match.dateTime, 'dd MMM, hh:mm a')}</div>
                                    )}
                                  </div>
                                  <div>{(match.team2?.name || match.team2) || 'Team 2'}</div>
                                </div>
                                <div className="text-xs text-gray-700">
                                  <div>Location: {match.location}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">No matches scheduled yet.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OngoingEvents;
