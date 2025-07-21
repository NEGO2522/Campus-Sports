import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaTrophy, FaRunning } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import UpcomingEvents from './UpcomingEvents';
import ActivityFeed from './ActivityFeed';

const Dashboard = () => {
  const navigate = useNavigate();


  const [stats, setStats] = useState([
    { id: 1, name: 'Upcoming Events', value: '0', icon: FaCalendarAlt, change: '0', changeType: 'neutral' },
    { id: 2, name: 'Active Members', value: '0', icon: FaUsers, change: '0', changeType: 'neutral' },
    { id: 3, name: 'Tournaments', value: '0', icon: FaTrophy, change: '0', changeType: 'neutral' },
    { id: 4, name: 'Activities', value: '0', icon: FaRunning, change: '0', changeType: 'neutral' },
  ]);

  // Fetch real stats from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch upcoming events count
        const eventsQuery = query(
          collection(db, 'events'),
          where('participants', 'array-contains', user.uid),
          where('status', '==', 'upcoming')
        );
        const eventsSnapshot = await getCountFromServer(eventsQuery);
        const eventsCount = eventsSnapshot.data().count;

        // Update stats with real data
        setStats(prevStats => 
          prevStats.map(stat => {
            if (stat.name === 'Upcoming Events') {
              return { ...stat, value: eventsCount.toString() };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'Find Players':
        navigate('/find-players');
        break;
      case 'Join Game':
        navigate('/join-game');
        break;
      case 'View Schedule':
        navigate('/schedule');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
            {[
              { name: 'Find Players', icon: '👥', color: 'bg-green-100 text-green-600' },
              { name: 'Join Game', icon: '⚽', color: 'bg-purple-100 text-purple-600' },
              { name: 'View Schedule', icon: '📋', color: 'bg-yellow-100 text-yellow-600' },
            ].map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.name)}
                className={`flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 rounded-lg ${action.color} hover:shadow-sm transition-all cursor-pointer h-full min-h-[80px] xs:min-h-[90px] sm:min-h-[100px]`}
              >
                <span className="text-lg xs:text-xl sm:text-2xl mb-1 xs:mb-1.5 sm:mb-2">{action.icon}</span>
                <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center px-1">{action.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <button 
              onClick={() => navigate('/schedule')}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All
            </button>
          </div>
          <UpcomingEvents onEventClick={() => navigate('/schedule')} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
