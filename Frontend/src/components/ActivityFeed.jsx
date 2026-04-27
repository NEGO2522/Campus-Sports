import React, { useEffect, useState } from 'react';
// No Firebase. TODO: connect to backend API
// import api from '../utils/api';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // TODO: const data = await api.get('/events?status=upcoming&limit=10');
        // const now = new Date();
        // const upcoming = data
        //   .filter(e => isAfter(new Date(e.dateTime), now))
        //   .map(e => ({ ...e, type: 'upcoming_event', timestamp: new Date(e.dateTime) }))
        //   .sort((a, b) => a.timestamp - b.timestamp);
        // setActivities(upcoming);
        setActivities([]); // empty until backend connected
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
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
