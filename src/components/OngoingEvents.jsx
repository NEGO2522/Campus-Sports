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
  // Move these hooks to the top to fix hook order error
  const [seeAllEventId, setSeeAllEventId] = useState(null);
  const [allMatchesData, setAllMatchesData] = useState({ matches: [], eventName: '' });
  const [showAllMatchesPage, setShowAllMatchesPage] = useState(false);

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
            // Include all fields from Firestore, including scores
            return {
              ...match,
              id: matchDoc.id,
              matchName: match.round || match.matchName || match.title || '',
              team1: { name: match.team1 },
              team2: { name: match.team2 },
              location: match.location,
              dateTime,
              description: match.description || '',
              matchStarted: match.matchStarted === true
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

  // ...existing code...

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4">
            <div className="lg:col-span-2">
              <div className="space-y-3 sm:space-y-4">
                {events.map((event, index) => {
                  const matches = matchesByEvent[event.id] || [];
                  const showSeeAll = matches.length > 2;
                  const matchesToShow = showSeeAll ? matches.slice(0, 2) : matches;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-gray-100 active:ring-gray-200"
                      onClick={() => onEventClick && onEventClick(event)}
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 xs:gap-2 mb-2">
                          <h3 className="text-sm xs:text-base font-semibold text-gray-900 truncate">
                            {event.eventName || event.title || 'Event'}
                          </h3>
                        </div>
                        <div className="mt-6 space-y-2">
                          {matchesToShow.length > 0 ? (
                            matchesToShow.map((match) => (
                              <div key={match.id} className="mb-2 last:mb-0">
                                {match.matchName && (
                                  <div className="font-bold text-orange-600 text-lg xs:text-xs mb-1 truncate">
                                    {match.matchName}
                                  </div>
                                )}
                                <div className="p-2 xs:p-3 bg-white rounded border border-green-200">
                                  <div className="text-sm xs:text-base text-black font-medium space-y-1.5">
                                    <div className="flex flex-row items-center justify-between gap-1">
                                      <span className="truncate">
                                        {(match.team1?.name || match.team1) || 'Team 1'}
                                        {/* Team 1 Score */}
                                        <span className="ml-20 text-base text-blue-500 font-bold">
                                          {(() => {
                                            const safeTeam1 = (match.team1?.name || match.team1 || 'Team 1').replace(/[~*\/\[\]]/g, '_');
                                            const team1Key = `score_${safeTeam1}`;
                                            const score = match[team1Key];
                                            return score !== undefined && score !== '' ? score : <span className="text-gray-400 font-normal">No score</span>;
                                          })()}
                                        </span>
                                      </span>
                                      <div className="flex-1"></div>
                                      {match.matchStarted === true ? (
                                        <div className="flex items-center text-red-600 font-bold text-[10px] xs:text-xs whitespace-nowrap ml-2">
                                          <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                                          LIVE
                                        </div>
                                      ) : (
                                        match.dateTime && (
                                          <div className="text-[10px] xs:text-xs text-gray-600 whitespace-nowrap ml-2">
                                            {format(match.dateTime, 'MMM d, h:mma').toLowerCase()}
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className="flex flex-row items-center justify-between gap-1 mt-1">
                                      <span className="truncate">
                                        {(match.team2?.name || match.team2) || 'Team 2'}
                                        {/* Team 2 Score */}
                                        <span className="ml-20 text-base text-blue-500 font-bold">
                                          {(() => {
                                            const safeTeam2 = (match.team2?.name || match.team2 || 'Team 2').replace(/[~*\/\[\]]/g, '_');
                                            const team2Key = `score_${safeTeam2}`;
                                            const score = match[team2Key];
                                            return score !== undefined && score !== '' ? score : <span className="text-gray-400 font-normal">No score</span>;
                                          })()}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                  {match.location && (
                                    <div className="mt-1.5 flex items-center text-[10px] xs:text-xs text-gray-600">
                                      <FaMapMarkerAlt className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                                      <span className="truncate">{match.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                                  

                            ))
                          ) : (
                            <div className="text-xs text-gray-500 text-center py-2">No matches scheduled yet.</div>
                          )}
                          {showSeeAll && (
                            <button
                              className="w-full mt-2 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow transition"
                              onClick={e => {
                                e.stopPropagation();
                                handleSeeAllMatches(event.id);
                              }}
                            >
                              See All
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OngoingEvents;
