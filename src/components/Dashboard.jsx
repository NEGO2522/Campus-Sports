import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaTrophy, FaRunning, FaMedal, FaCrown, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import UpcomingEvents from './UpcomingEvents';
import OngoingEvents from './OngoingEvents';
import ActivityFeed from './ActivityFeed';

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

  const handleQuickAction = (action) => {
    switch(action) {
      case 'Find Players':
        navigate('/find-players');
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
          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            {[
              { name: 'Find Players', icon: '👥', color: 'bg-green-100 text-green-600' },
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

        {/* Ongoing Events */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Ongoing Events
            </h2>
          </div>
          
          {/* Sidebar Layout: Events on left, Standings on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Events Section - Takes 2/3 of the width on large screens */}
            <div className="lg:col-span-2">
              <OngoingEvents onEventClick={() => navigate('/schedule')} />
              
              {/* See All Button */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => navigate('/schedule')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  See All →
                </button>
              </div>
            </div>
            
            {/* Tournament Bracket Section - Takes 1/3 of the width on large screens */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" />
                    Tournament Bracket
                  </h3>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
                
                {/* Tournament Bracket */}
                <div className="space-y-4">
                  {/* Winner at Top */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg p-2 shadow-lg mb-2">
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
                
                {/* View Full Bracket Link */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/tournament-bracket')}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    View Full Bracket →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <UpcomingEvents onEventClick={() => navigate('/schedule')} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
