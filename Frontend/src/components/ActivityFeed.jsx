import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    const now = new Date();
    
    // Query for upcoming events
    const eventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );

    // Subscribe to real-time updates for events
    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        try {
          const upcomingEvents = [];
          const now = new Date();
          
          // Process each event
          snapshot.forEach((doc) => {
            const eventData = doc.data();
            const eventDate = eventData.dateTime?.toDate ? eventData.dateTime.toDate() : new Date(eventData.dateTime);
            
            // Only include future events
            if (isAfter(eventDate, now)) {
              upcomingEvents.push({
                id: doc.id,
                ...eventData,
                type: 'upcoming_event',
                timestamp: eventDate,
                isPublic: true
              });
            }
          });
          
          // Sort by date (nearest first)
          const sortedEvents = upcomingEvents
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, 10); // Limit to 10 upcoming events
            
          setActivities(sortedEvents);
          setLoading(false);
          
        } catch (error) {
          console.error('Error processing upcoming events:', error);
          setActivities([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching upcoming events:', error);
        setActivities([]);
        setLoading(false);
      }
    );

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to render activity icon based on event type
  const renderActivityIcon = (activity) => {
    const sportIcons = {
      football: '⚽',
      basketball: '🏀',
      cricket: '🏏',
      tennis: '🎾',
      badminton: '🏸',
      volleyball: '🏐',
      default: '🏟️'
    };
    
    return sportIcons[activity.sport?.toLowerCase()] || sportIcons.default;
  };
  
  // Function to format the activity message for upcoming events
  const formatActivityMessage = (activity) => {
    if (activity.type === 'upcoming_event') {
      return (
        <div>
          <span className="font-medium">{activity.eventName}</span>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <FaCalendarAlt className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span>{format(activity.timestamp, 'MMM d, yyyy h:mm a')}</span>
            <span className="mx-1.5">•</span>
            <FaMapMarkerAlt className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <FaUsers className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span>{activity.participants?.length || 0} / {activity.playersNeeded} players</span>
          </div>
        </div>
      );
    }
    
    return activity.message || 'New event';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <p>No upcoming events found. Create a new event or check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          className="flex items-start p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg flex-shrink-0">
            {renderActivityIcon(activity)}
          </div>
          <div className="ml-2 sm:ml-3 overflow-hidden">
            <div className="text-xs sm:text-sm text-gray-700">
              {formatActivityMessage(activity)}
            </div>
            <div className="mt-1">
              <span className="text-[10px] xs:text-xs text-blue-600 font-medium">
                {activity.timestamp ? `Starts ${formatDistanceToNow(activity.timestamp, { addSuffix: true })}` : 'Coming soon'}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
