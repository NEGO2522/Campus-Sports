import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { GiSoccerBall, GiBasketballBasket, GiTennisBall, GiVolleyballBall } from 'react-icons/gi';

const games = [
  {
    id: 1,
    sport: 'Football',
    title: 'Weekend Football Match',
    date: '2023-07-30',
    time: '10:00 AM - 12:00 PM',
    location: 'City Sports Complex',
    players: '8/12',
    skillLevel: 'Intermediate',
    organizer: 'Alex Johnson',
    organizerRating: 4.8,
    distance: '1.2 miles away',
    price: '$5',
    image: 'https://images.unsplash.com/photo-1579952363872-2897dc4f2f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    sport: 'Basketball',
    title: 'Evening Basketball',
    date: '2023-07-28',
    time: '6:00 PM - 8:00 PM',
    location: 'Downtown Court',
    players: '3/10',
    skillLevel: 'All Levels',
    organizer: 'Mike Chen',
    organizerRating: 4.5,
    distance: '0.8 miles away',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    sport: 'Tennis',
    title: 'Tennis Doubles',
    date: '2023-07-29',
    time: '4:00 PM - 6:00 PM',
    location: 'Riverside Tennis Club',
    players: '3/4',
    skillLevel: 'Advanced',
    organizer: 'Sarah Miller',
    organizerRating: 4.9,
    distance: '2.1 miles away',
    price: '$10',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    sport: 'Volleyball',
    title: 'Beach Volleyball',
    date: '2023-07-31',
    time: '5:00 PM - 7:00 PM',
    location: 'Sunset Beach',
    players: '6/12',
    skillLevel: 'Casual',
    organizer: 'Emma Wilson',
    organizerRating: 4.7,
    distance: '3.5 miles away',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1519311965067-36c3e2c835a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    sport: 'Basketball',
    title: 'Morning Basketball',
    date: '2023-07-27',
    time: '7:00 AM - 9:00 AM',
    location: 'Central Park Court',
    players: '5/10',
    skillLevel: 'Intermediate',
    organizer: 'David Kim',
    organizerRating: 4.6,
    distance: '1.8 miles away',
    price: '$3',
    image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    sport: 'Football',
    title: '5-a-side Football',
    date: '2023-07-28',
    time: '7:30 PM - 9:30 PM',
    location: 'Indoor Arena',
    players: '7/10',
    skillLevel: 'All Levels',
    organizer: 'James Wilson',
    organizerRating: 4.4,
    distance: '2.3 miles away',
    price: '$8',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const sportIcons = {
  'Football': <GiSoccerBall className="text-green-600" />,
  'Basketball': <GiBasketballBasket className="text-orange-600" />,
  'Tennis': <GiTennisBall className="text-blue-600" />,
  'Volleyball': <GiVolleyballBall className="text-purple-600" />,
};

const JoinGame = () => {
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredGames = games.filter(game => {
    return (
      (sportFilter === 'All Sports' || game.sport === sportFilter) &&
      (dateFilter === '' || game.date === dateFilter) &&
      (locationFilter === '' || game.location.toLowerCase().includes(locationFilter.toLowerCase()))
    );
  });

  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Volleyball'];
  const dates = ['', '2023-07-27', '2023-07-28', '2023-07-29', '2023-07-30', '2023-07-31'];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Find a Game to Join</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City or venue"
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSearch className="mr-2 text-gray-400" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Date</option>
                    {dates.filter(date => date !== '').map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Any Level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Any Price</option>
                    <option>Free</option>
                    <option>Paid</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-200 relative overflow-hidden">
              <img 
                src={game.image} 
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">{sportIcons[game.sport] || sportIcons['Football']}</span>
                {game.sport}
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {game.price === 'Free' ? 'Free to join' : game.price}
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{game.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  game.players.split('/')[0] === game.players.split('/')[1] 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {game.players} players
                </span>
              </div>
              
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  <span>
                    {new Date(game.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' • '}
                    {game.time}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  <span>{game.location}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="mr-2 text-gray-400" />
                  <span>Skill level: {game.skillLevel}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                      <img 
                        src={`https://randomuser.me/api/portraits/men/${game.organizer.length % 50}.jpg`} 
                        alt={game.organizer}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Organized by</p>
                      <p className="text-sm font-medium">{game.organizer}</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Join Game
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredGames.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <FaSearch className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No games found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search filters to find more games.</p>
          <button 
            onClick={() => {
              setSportFilter('All Sports');
              setDateFilter('');
              setLocationFilter('');
              setShowFilters(false);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinGame;
