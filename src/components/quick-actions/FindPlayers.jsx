import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUserFriends, FaStar, FaMapMarkerAlt, FaRunning } from 'react-icons/fa';

const players = [
  {
    id: 1,
    name: 'Alex Johnson',
    sports: ['Football', 'Basketball'],
    location: 'Downtown',
    rating: 4.8,
    matches: 24,
    skill: 'Advanced',
    availability: 'Weekends, Evenings',
    lastActive: '2 hours ago',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Sarah Miller',
    sports: ['Tennis', 'Badminton'],
    location: 'West End',
    rating: 4.9,
    matches: 36,
    skill: 'Advanced',
    availability: 'Mornings, Weekends',
    lastActive: '30 minutes ago',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Mike Chen',
    sports: ['Basketball', 'Volleyball'],
    location: 'East Side',
    rating: 4.5,
    matches: 12,
    skill: 'Intermediate',
    availability: 'Evenings',
    lastActive: '5 hours ago',
    image: 'https://randomuser.me/api/portraits/men/75.jpg'
  },
  {
    id: 4,
    name: 'Emma Wilson',
    sports: ['Tennis', 'Table Tennis'],
    location: 'North District',
    rating: 4.7,
    matches: 18,
    skill: 'Intermediate',
    availability: 'Afternoons, Weekends',
    lastActive: '1 hour ago',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
];

const FindPlayers = () => {
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Levels');

  const filteredPlayers = players.filter(player => {
    return (
      (sportFilter === 'All Sports' || player.sports.includes(sportFilter)) &&
      (locationFilter === '' || player.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (skillFilter === 'All Levels' || player.skill === skillFilter)
    );
  });

  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Table Tennis'];
  const skillLevels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <FaUserFriends className="mr-3 text-green-500" />
          Find Players
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Sport</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaRunning className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="City or area"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors h-[42px] flex items-center justify-center">
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start">
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-green-100"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                  <div className="flex items-center mt-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">{player.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{player.matches} matches</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {player.sports.map((sport) => (
                      <span key={sport} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{player.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Skill Level</p>
                    <p className="font-medium">{player.skill}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Availability</p>
                    <p className="font-medium">{player.availability}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Active</p>
                    <p className="font-medium">{player.lastActive}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Message
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-50 text-green-700 font-medium py-2 px-4 border border-green-300 rounded-lg transition-colors">
                    Invite to Play
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <FaUserFriends className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No players found</h3>
          <p className="text-gray-500">Try adjusting your search filters to find more players.</p>
        </div>
      )}
    </div>
  );
};

export default FindPlayers;
