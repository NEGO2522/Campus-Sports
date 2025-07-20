import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, or, and } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    
    // Create a query for public activities or activities related to the current user
    const activitiesQuery = user
      ? query(
          collection(db, 'activities'),
          and(
            where('isPublic', '==', true),
            or(
              where('userId', '==', user.uid),
              where('eventLocation', '==', 'Poornima University'),
              where('eventType', '==', 'football')
            )
          ),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      : query(
          collection(db, 'activities'),
          where('isPublic', '==', true),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

    // Add Football Match at Poornima University as a default activity if no activities exist
    const defaultActivity = {
      id: 'football-poornima',
      type: 'event_created',
      message: 'New Football Match at Poornima University',
      timestamp: new Date(),
      eventType: 'football',
      eventLocation: 'Poornima University',
      isPublic: true
    };

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        let activitiesData = [];
        
        // Add default activity if no activities exist
        if (snapshot.empty) {
          activitiesData = [defaultActivity];
        } else {
          activitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          
          // Add default activity if not already in the list
          if (!activitiesData.some(activity => 
            activity.eventLocation === 'Poornima University' && 
            activity.eventType === 'football')) {
            activitiesData = [defaultActivity, ...activitiesData];
          }
        }
        
        // Sort by timestamp and limit to 10 items
        activitiesData = activitiesData
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .slice(0, 10);
          
        setActivities(activitiesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching activities:', error);
        // Show default activity even if there's an error
        setActivities([defaultActivity]);
        setLoading(false);
      }
    );

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to render activity icon based on type
  const renderActivityIcon = (activity) => {
    if (activity.eventType === 'football' && activity.eventLocation === 'Poornima University') {
      return '⚽';
    }
    
    switch (activity.type) {
      case 'event_created':
        return '📅';
      case 'event_joined':
        return '👥';
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      default:
        return '🔔';
    }
  };
  
  // Function to format the activity message
  const formatActivityMessage = (activity) => {
    if (activity.eventType === 'football' && activity.eventLocation === 'Poornima University') {
      return '⚽ Football Match at Poornima University';
    }
    return activity.message || 'New activity';
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
        <p>No activities yet. Start by creating or joining events!</p>
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
            {renderActivityIcon(activity.type)}
          </div>
          <div className="ml-2 sm:ml-3 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-700">
              {formatActivityMessage(activity)}
              {activity.eventLocation === 'Poornima University' && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                  Live
                </span>
              )}
            </p>
            <div className="flex items-center mt-0.5 sm:mt-1 flex-wrap">
              <span className="text-[10px] xs:text-xs text-gray-500">
                {activity.timestamp ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) : 'Just now'}
              </span>
              {activity.sport && (
                <>
                  <span className="mx-1.5 sm:mx-2 text-gray-300">•</span>
                  <span className="text-[10px] xs:text-xs font-medium text-gray-700">
                    {activity.sport}
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
