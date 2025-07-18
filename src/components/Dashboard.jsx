import React from 'react';
import { signOutUser } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaCalendarAlt, FaUsers, FaTrophy, FaRunning } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOutUser();
    if (!error) {
      navigate('/');
    }
  };

  const stats = [
    { id: 1, name: 'Upcoming Events', value: '5', icon: FaCalendarAlt, change: '+2', changeType: 'positive' },
    { id: 2, name: 'Active Members', value: '128', icon: FaUsers, change: '+12', changeType: 'positive' },
    { id: 3, name: 'Tournaments', value: '3', icon: FaTrophy, change: '0', changeType: 'neutral' },
    { id: 4, name: 'Activities', value: '8', icon: FaRunning, change: '+3', changeType: 'positive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : stat.changeType === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {stat.changeType === 'positive' ? '↑' : stat.changeType === 'negative' ? '↓' : '→'} {stat.change}
                </div>
                <span className="ml-2 text-sm text-gray-500">from last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Create Event', icon: '📅', color: 'bg-blue-100 text-blue-600' },
              { name: 'Find Players', icon: '👥', color: 'bg-green-100 text-green-600' },
              { name: 'Join Game', icon: '⚽', color: 'bg-purple-100 text-purple-600' },
              { name: 'View Schedule', icon: '📋', color: 'bg-yellow-100 text-yellow-600' },
            ].map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ y: -2 }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.color} hover:shadow-md transition-all`}
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
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
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium flex-shrink-0">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-700">{activity.sport}</span>
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
