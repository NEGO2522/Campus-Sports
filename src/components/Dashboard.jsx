import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaTrophy, FaRunning } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();


  const stats = [
    { id: 1, name: 'Upcoming Events', value: '5', icon: FaCalendarAlt, change: '+2', changeType: 'positive' },
    { id: 2, name: 'Active Members', value: '128', icon: FaUsers, change: '+12', changeType: 'positive' },
    { id: 3, name: 'Tournaments', value: '3', icon: FaTrophy, change: '0', changeType: 'neutral' },
    { id: 4, name: 'Activities', value: '8', icon: FaRunning, change: '+3', changeType: 'positive' },
  ];

  const handleQuickAction = (action) => {
    switch(action) {
      case 'Create Event':
        navigate('/create-event');
        break;
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center flex-wrap">
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
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { name: 'Create Event', icon: '📅', color: 'bg-blue-100 text-blue-600' },
              { name: 'Find Players', icon: '👥', color: 'bg-green-100 text-green-600' },
              { name: 'Join Game', icon: '⚽', color: 'bg-purple-100 text-purple-600' },
              { name: 'View Schedule', icon: '📋', color: 'bg-yellow-100 text-yellow-600' },
            ].map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.name)}
                className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl ${action.color} hover:shadow-sm sm:hover:shadow-md transition-all cursor-pointer`}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2">{action.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-center">{action.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { id: 1, user: 'Alex Johnson', action: 'joined your event', time: '2 min ago', sport: 'Basketball' },
              { id: 2, user: 'Sarah Miller', action: 'commented on your post', time: '1 hour ago', sport: 'Football' },
              { id: 3, user: 'Mike Chen', action: 'started following you', time: '3 hours ago', sport: 'Tennis' },
            ].map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * activity.id }}
                className="flex items-start p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium flex-shrink-0 text-xs sm:text-sm">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-2 sm:ml-3 overflow-hidden">
                  <p className="text-xs sm:text-sm text-gray-700 truncate">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <div className="flex items-center mt-0.5 sm:mt-1 flex-wrap">
                    <span className="text-[10px] xs:text-xs text-gray-500">{activity.time}</span>
                    <span className="mx-1.5 sm:mx-2 text-gray-300">•</span>
                    <span className="text-[10px] xs:text-xs font-medium text-gray-700">{activity.sport}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
