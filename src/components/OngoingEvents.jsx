import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCheck, FaClock, FaPlay, FaSpinner, FaChevronDown, FaChevronUp, FaTrophy, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

const OngoingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participatingEvents, setParticipatingEvents] = useState({});
  const [showSchedule, setShowSchedule] = useState(null);
  const [eventSchedule, setEventSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isFootballExpanded, setIsFootballExpanded] = useState(true);

  useEffect(() => {
    // STATIC DATA for demo purposes
    const staticEvents = [
      {
        id: '1',
        sport: 'Football (5v5)',
        matchName: 'Semifinal 1',
        team1: { name: 'Thunder Bolts' },
        team2: { name: 'Eagles' },
        location: 'Main Stadium',
        dateTime: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        eventName: 'Football 5v5 Semifinal',
        description: 'Exciting semifinal match between Thunder Bolts and Eagles.'
      },
      {
        id: '3',
        sport: 'Football (5v5)',
        matchName: 'Final',
        team1: { name: 'Lions' },
        team2: { name: 'Warriors' },
        location: 'Main Stadium',
        dateTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        eventName: 'Football 5v5 Final',
        description: 'Championship final match between Lions and Warriors.'
      },
      {
        id: '4',
        sport: 'Football (5v5)',
        matchName: 'Semifinal 2',
        team1: { name: 'Sharks' },
        team2: { name: 'Phoenix' },
        location: 'Stadium B',
        dateTime: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
        eventName: 'Football 5v5 Semifinal 2',
        description: 'Second semifinal match between Sharks and Phoenix.'
      },
    ];
    setEvents(staticEvents);
    setLoading(false);
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

  // Separate football and non-football events
  const footballMatches = events.filter(event => event.sport?.toLowerCase() === 'football (5v5)');
  const nonFootballEvents = events.filter(event => event.sport?.toLowerCase() !== 'football (5v5)');


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
      {/* Football (5 v 5) Section */}
      {footballMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Football Section Header with Dropdown Arrow */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFootballExpanded(!isFootballExpanded)}
          >
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Football (5 v 5)</span>
              <span className="ml-2 text-sm text-gray-500">({footballMatches.length} matches)</span>
            </div>
            <div className="text-gray-400">
              {isFootballExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
          
          {/* Football Matches - Collapsible */}
          {isFootballExpanded && (
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                {/* Live Matches Section - Takes 2/3 of the width */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                {footballMatches
                  .filter(event => ["semifinal 1", "semifinal 2"].includes((event.matchName || event.title || '').toLowerCase()))
                  .slice(0, 2)
                  .map((event, index) => {
                  const isParticipating = participatingEvents[event.id];
                  const isFull = event.participants?.length >= event.playersNeeded;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-gray-100 active:ring-gray-200"
                      onClick={() => onEventClick && onEventClick(event)}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Live indicator */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                             <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-gray-900 text-base">
                                {event.matchName || event.title || 'Match'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="flex flex-col space-y-3">
                          {/* Sports name */}
                          <div className="flex items-center">
                            {isParticipating && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheck className="mr-1" /> Participating
                              </span>
                            )}
                          </div>

                          {/* Match details */}
                          <div className="mt-2 mb-2 p-3 bg-white rounded border border-green-300">
                           
                            <div className="text-lg text-black font-medium mt-1 mb-2">
                              <div className="flex items-center justify-between mb-2">
                                <div>{(event.team1?.name || event.team1) || 'Team 1'}</div>
                                <div className="flex items-center ml-4">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                  <span className="text-xs font-bold text-red-600">LIVE</span>
                                </div>
                              </div>
                              <div>{(event.team2?.name || event.team2) || 'Team 2'}</div>
                            </div>
                            <div className="text-xs text-gray-700">
                              Location: {event.location}
                            </div>
                          </div>

                         
                        </div>

                        {/* Schedule/Details Section */}
                        {showSchedule === event.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Event Details</h4>
                            {scheduleLoading ? (
                              <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                              </div>
                            ) : eventSchedule ? (
                              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Started</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {format(new Date(eventSchedule.date), 'EEEE, MMMM d, yyyy')} at {format(new Date(eventSchedule.date), 'h:mm a')}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">({eventSchedule.startedTime})</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="text-sm font-medium text-gray-900">{eventSchedule.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="text-sm font-medium text-orange-600 flex items-center">
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                      {eventSchedule.status}
                                    </p>
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
                              <p className="text-sm text-gray-500">No details available.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                  })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => navigate('/schedule')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  See All →
                </button>
              </div>
                </div>
                
                {/* Tournament Standings Section - Takes 1/3 of the width */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center">
                        <FaTrophy className="mr-2 text-yellow-500" />
                        Tournament Standing
                      </h3>
                    </div>
                    
                    {/* Tournament Bracket */}
                    <div className="space-y-4">
                      {/* Winner at Top */}
                      <div className="text-center">
                        <div className="bg-yellow-500 text-white rounded-lg p-2 shadow-lg mb-2">
                          <div className="text-xs font-bold">WINNER</div>
                          <div className="text-sm font-bold">Thunder Bolts</div>
                        </div>
                      </div>
                      
                      {/* Final Match */}
                      <div className="bg-white rounded-lg p-3 border-2 border-blue-300 shadow-sm">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">FINAL</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded border">
                              <span className="text-sm font-medium text-gray-900">Thunder Bolts</span>
                              <span className="text-sm font-bold text-green-600">3</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded border">
                              <span className="text-sm font-medium text-gray-900">Lightning FC</span>
                              <span className="text-sm font-bold text-red-600">1</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Semi-Finals */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2 border shadow-sm">
                          <div className="text-xs text-gray-500 text-center mb-1">SEMI 1</div>
                          <div className="space-y-1">
                            <div className="text-xs bg-green-50 p-1 rounded flex justify-between">
                              <span>Thunder</span>
                              <span className="font-bold text-green-600">2</span>
                            </div>
                            <div className="text-xs bg-gray-50 p-1 rounded flex justify-between">
                              <span>Storm</span>
                              <span className="font-bold text-gray-500">0</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-2 border shadow-sm">
                          <div className="text-xs text-gray-500 text-center mb-1">SEMI 2</div>
                          <div className="space-y-1">
                            <div className="text-xs bg-green-50 p-1 rounded flex justify-between">
                              <span>Lightning</span>
                              <span className="font-bold text-green-600">3</span>
                            </div>
                            <div className="text-xs bg-gray-50 p-1 rounded flex justify-between">
                              <span>Fire</span>
                              <span className="font-bold text-gray-500">2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quarter-Finals */}
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-white rounded p-1.5 border shadow-sm">
                          <div className="text-xs text-gray-400 text-center">QF1</div>
                          <div className="text-xs space-y-0.5">
                            <div className="flex justify-between">
                              <span>Thunder</span>
                              <span className="font-bold">1</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Eagles</span>
                              <span>0</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-1.5 border shadow-sm">
                          <div className="text-xs text-gray-400 text-center">QF2</div>
                          <div className="text-xs space-y-0.5">
                            <div className="flex justify-between">
                              <span>Storm</span>
                              <span className="font-bold">2</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Wolves</span>
                              <span>1</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-1.5 border shadow-sm">
                          <div className="text-xs text-gray-400 text-center">QF3</div>
                          <div className="text-xs space-y-0.5">
                            <div className="flex justify-between">
                              <span>Lightning</span>
                              <span className="font-bold">4</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Knights</span>
                              <span>1</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-1.5 border shadow-sm">
                          <div className="text-xs text-gray-400 text-center">QF4</div>
                          <div className="text-xs space-y-0.5">
                            <div className="flex justify-between">
                              <span>Fire</span>
                              <span className="font-bold">3</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Tigers</span>
                              <span>2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Other Sports Events */}
      {nonFootballEvents.length > 0 && (
        <div className="space-y-4">
          {nonFootballEvents.map((event, index) => {
        const isParticipating = participatingEvents[event.id];
        const isFull = event.participants?.length >= event.playersNeeded;
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-orange-200 hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-orange-100 active:ring-orange-200"
            onClick={() => onEventClick && onEventClick(event)}
          >
            <div className="p-4 sm:p-5">
              {/* Live indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-red-600">LIVE</span>
                  </div>
                  <span className="text-xs text-gray-500">Started {getElapsedTime(event.dateTime)}</span>
                </div>
              </div>

              {/* Left side - Sports name, Location, Started time */}
              <div className="flex flex-col space-y-3">
                {/* Sports name */}
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.sport?.toLowerCase() === 'football (5v5)'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {event.sport}
                    {event.location?.toLowerCase().includes('poornima') && (
                      <span className="ml-1 text-[10px] bg-yellow-100 text-yellow-800 rounded-full px-1.5">Featured</span>
                    )}
                  </span>
                  {isParticipating && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheck className="mr-1" /> Participating
                    </span>
                  )}
                </div>

                {/* Football (5v5) match details */}
                {event.sport?.toLowerCase() === 'football (5v5)' && (
                  <div className="mt-2 mb-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="font-semibold text-green-900 text-sm">
                      {event.matchName || event.title || 'Match'}
                    </div>
                    <div className="text-xs text-green-800 font-medium mt-1 mb-1">
                      {(event.team1?.name || event.team1) || 'Team 1'} vs {(event.team2?.name || event.team2) || 'Team 2'}
                    </div>
                    <div className="text-xs text-gray-700">
                      Location: {event.location}
                    </div>
                    </div>
                )}

                {/* Event name and location for non-Football (5v5) events */}
                {event.sport?.toLowerCase() !== 'football (5v5)' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">{event.eventName}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </>
                )}

                {/* Started time */}
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  <span>Started {format(new Date(event.dateTime), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.dateTime), 'h:mm a')}</span>
                </div>

                {/* Additional info */}
                {/* Player count removed as requested */}

                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                )}
              </div>

              {/* Schedule/Details Section */}
              {showSchedule === event.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Event Details</h4>
                  {scheduleLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : eventSchedule ? (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Started</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(eventSchedule.date), 'EEEE, MMMM d, yyyy')} at {format(new Date(eventSchedule.date), 'h:mm a')}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">({eventSchedule.startedTime})</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{eventSchedule.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="text-sm font-medium text-orange-600 flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                            {eventSchedule.status}
                          </p>
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
                    <p className="text-sm text-gray-500">No details available.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingEvents;
