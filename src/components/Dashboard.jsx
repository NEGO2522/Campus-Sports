import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { FaCalendarAlt, FaUsers, FaTrophy, FaRunning, FaCalendarPlus, FaClipboardList } from 'react-icons/fa';
import UpcomingEvents from './UpcomingEvents';
import OngoingEvents from './OngoingEvents';
import Leaderboard from './Leaderboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState([
    { id: 1, name: 'Upcoming Events', value: '0', icon: FaCalendarAlt, change: '0', changeType: 'neutral' },
    { id: 2, name: 'Your Points', value: '0', icon: FaTrophy, change: '0', changeType: 'positive' },
  ]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Set up real-time listener for events
        const eventsQuery = query(
          collection(db, 'events'),
          where('endTime', '>=', Timestamp.now()),
          orderBy('endTime')
        );

        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
          const upcomingEvents = [];
          let totalParticipants = 0;
          
          snapshot.forEach((doc) => {
            const event = { id: doc.id, ...doc.data() };
            upcomingEvents.push(event);
            if (event.participants) {
              totalParticipants += event.participants.length;
            }
          });
          
          // Update stats
          setStats(prevStats => [
            { ...prevStats[0], value: upcomingEvents.length.toString() },
            prevStats[1] // Keep the points stat as is
          ]);
        });

        setIsLoading(false);
        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-24 md:pt-28 pb-6 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Welcome back! Here's what's happening.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8 max-w-2xl">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : stat.changeType === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {stat.changeType === 'positive' ? '↑' : stat.changeType === 'negative' ? '↓' : '→'} {stat.change}
                </span>
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs text-gray-500">from last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">Quick Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/create-event"
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center text-sm sm:text-base"
            >
              <FaCalendarPlus className="text-blue-500 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Create New Event</span>
            </Link>
            <Link
              to="/manage-events"
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center text-sm sm:text-base lg:col-span-1"
            >
              <FaClipboardList className="text-green-500 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Manage Events</span>
            </Link>
          </div>
        </div>

        {/* Upcoming and Ongoing Events */}
        <div className="space-y-6 sm:space-y-8">
          <UpcomingEvents />
          <OngoingEvents />
          <div className="w-full -mx-3 sm:mx-0">
            <Leaderboard limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;