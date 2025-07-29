import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import UpcomingEvents from './UpcomingEvents';
import OngoingEvents from './OngoingEvents';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample leaderboard data - you can customize this
  const [leaderboardData] = useState([
    { id: 1, name: 'John Smith', points: 2850, position: 1, avatar: '👨‍💼', sport: 'Football', streak: 12 },
    { id: 2, name: 'Sarah Johnson', points: 2720, position: 2, avatar: '👩‍💼', sport: 'Basketball', streak: 8 },
    { id: 3, name: 'Mike Wilson', points: 2650, position: 3, avatar: '🧑‍💼', sport: 'Tennis', streak: 15 },
    { id: 4, name: 'Emma Davis', points: 2580, position: 4, avatar: '👩‍🦰', sport: 'Volleyball', streak: 6 },
    { id: 5, name: 'Alex Brown', points: 2490, position: 5, avatar: '🧑‍🦱', sport: 'Cricket', streak: 9 },
  ]);

  const [stats, setStats] = useState([]);

  // Set up real-time listener for upcoming events count
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Get current time
    const now = Timestamp.now();
    
    // Query for upcoming events where user is a participant
    const eventsQuery = query(
      collection(db, 'events'),
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'upcoming'),
      where('dateTime', '>=', now)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
      const eventsCount = querySnapshot.size;
      
      // Update stats with real-time data
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.name === 'Upcoming Events') {
            return { ...stat, value: eventsCount.toString() };
          }
          return stat;
        })
      );
    }, (error) => {
      console.error('Error listening to events:', error);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="bg-white p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 border border-gray-100 h-full flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 xs:mt-1">{stat.value}</p>
                </div>
                <div className={`p-1.5 xs:p-2 sm:p-3 rounded-lg ${stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  <stat.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-2 xs:mt-3 sm:mt-4 flex items-center flex-wrap">
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : stat.changeType === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {stat.changeType === 'positive' ? '↑' : stat.changeType === 'negative' ? '↓' : '→'} {stat.change}
                </div>
                <span className="ml-1.5 text-xs xs:text-sm text-gray-500 whitespace-nowrap">from last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ongoing Events */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              Ongoing Events
            </h2>
          </div>
          
          <div className="p-7">
            <div className="lg:col-span-2">
              <OngoingEvents />
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <UpcomingEvents />
        </div>

              </div>
    </div>
  );
};

export default Dashboard;
