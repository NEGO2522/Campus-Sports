import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaArrowRight, FaSpinner, FaClock, FaCheck } from 'react-icons/fa';
import { GiSoccerBall, GiBasketballBasket, GiTennisBall, GiVolleyballBall, GiCricketBat } from 'react-icons/gi';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'react-toastify';

// Sport icons mapping
const sportIcons = {
  'Football': <GiSoccerBall className="text-green-600" />,
  'Basketball': <GiBasketballBasket className="text-orange-600" />,
  'Tennis': <GiTennisBall className="text-blue-600" />,
  'Volleyball': <GiVolleyballBall className="text-purple-600" />,
  'Cricket': <GiCricketBat className="text-red-600" />,
};

const JoinGame = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [participatedEvents, setParticipatedEvents] = useState(new Set());
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time events from Firestore
  useEffect(() => {
    setLoading(true);
    
    let allEvents = [];
    let loadingCount = 2;
    
    const checkComplete = () => {
      loadingCount--;
      if (loadingCount === 0) {
        // Sort all events by date (nearest first)
        allEvents.sort((a, b) => a.rawDateTime - b.rawDateTime);
        setGames(allEvents);
        setFilteredGames(allEvents);
        setLoading(false);
      }
    };
    
    // Process events function
    const processEvents = async (querySnapshot, status) => {
      const now = new Date();
      
      // Process events in parallel
      const eventsPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const event = { id: docSnapshot.id, ...docSnapshot.data() };
        const eventDate = event.dateTime?.toDate ? event.dateTime.toDate() : new Date(event.dateTime);
        
        // For upcoming events, only include future events; for ongoing, include all
        if (status === 'ongoing' || eventDate >= now) {
          // Get organizer's display name if available
          let organizerName = 'Organizer';
          
          if (event.createdBy) {
            try {
              const userDoc = await getDoc(doc(db, 'users', event.createdBy));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Try different possible fields for the name
                organizerName = userData.displayName || 
                              userData.name || 
                              userData.username || 
                              (userData.email ? userData.email.split('@')[0] : 'Organizer');
              }
            } catch (error) {
              console.error('Error fetching organizer info:', error);
            }
          } else if (event.organizerName) {
            // If organizer name is directly in the event
            organizerName = event.organizerName;
          }

          return {
            id: event.id,
            sport: event.sport || 'General',
            title: event.eventName || 'New Event',
            date: format(eventDate, 'yyyy-MM-dd'),
            time: format(eventDate, 'h:mm a'),
            endTime: event.endTime?.toDate ? 
              format(event.endTime.toDate(), 'h:mm a') :
              format(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), 'h:mm a'),
            location: event.location || 'Location not specified',
            players: `${event.participants?.length || 0}/${event.playersNeeded || 0}`,
            skillLevel: event.skillLevel || 'All Levels',
            organizer: organizerName,
            organizerId: event.createdBy,
            price: event.price || 'Free',
            description: event.description || 'Join us for a fun game!',
            image: event.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1005&q=80',
            participants: event.participants || [],
            playersNeeded: event.playersNeeded || 0,
            rawDateTime: eventDate,
            isFull: event.participants?.length >= event.playersNeeded,
            status: status
          };
        }
        return null;
      });
      
      // Wait for all events to be processed
      const events = (await Promise.all(eventsPromises)).filter(Boolean);
      allEvents = [...allEvents, ...events];
      checkComplete();
    };
    
    // Create queries for both upcoming and ongoing events
    const upcomingQ = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );
    
    const ongoingQ = query(
      collection(db, 'events'),
      where('status', '==', 'ongoing'),
      orderBy('dateTime')
    );

    // Subscribe to upcoming events
    const unsubscribeUpcoming = onSnapshot(upcomingQ, async (querySnapshot) => {
      allEvents = allEvents.filter(event => event.status !== 'upcoming');
      await processEvents(querySnapshot, 'upcoming');
    }, (error) => {
      console.error('Error getting upcoming events:', error);
      checkComplete();
    });
    
    // Subscribe to ongoing events
    const unsubscribeOngoing = onSnapshot(ongoingQ, async (querySnapshot) => {
      allEvents = allEvents.filter(event => event.status !== 'ongoing');
      await processEvents(querySnapshot, 'ongoing');
    }, (error) => {
      console.error('Error getting ongoing events:', error);
      checkComplete();
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUpcoming();
      unsubscribeOngoing();
    };
  }, []);

  // Handle joining a game
  const handleJoinGame = async (game) => {
    if (!user) {
      toast.error('Please log in to join games');
      return;
    }

    try {
      const eventRef = doc(db, 'events', game.id);
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      });
      
      // Update local state to reflect participation
      setParticipatedEvents(prev => {
        const newSet = new Set(prev);
        newSet.add(game.id);
        return newSet;
      });
      
      toast.success('Successfully joined the game!');
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please try again.');
    }
  };

  // Check if current user is already a participant in an event
  const isParticipating = (event) => {
    if (!user) return false;
    
    // Check local state first
    if (participatedEvents.has(event.id)) {
      return true;
    }
    
    // Check if user is in the participants array
    const participants = event.participants || [];
    return participants.includes(user.uid);
  };

  // Apply filters
  useEffect(() => {
    const filtered = games.filter(game => {
      return (
        (sportFilter === 'All Sports' || game.sport === sportFilter) &&
        (dateFilter === '' || game.date === dateFilter) &&
        (locationFilter === '' || game.location.toLowerCase().includes(locationFilter.toLowerCase()))
      );
    });
    setFilteredGames(filtered);
  }, [games, sportFilter, dateFilter, locationFilter]);

  const uniqueDates = [...new Set(games.map(game => game.date))].sort();
  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Cricket'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Explore Games</h1>
          <p className="text-gray-600">
            {loading ? 'Loading events...' : `Found ${filteredGames.length} upcoming games`}
          </p>
        </div>
        <span className="text-sm text-gray-500 mt-1 sm:mt-0">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} available
        </span>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
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
                  {uniqueDates.map((date) => (
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
      </motion.div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FaSearch className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No games found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {games.length === 0 
              ? 'No upcoming games available. Check back later!'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
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
                  <div className="flex justify-end">
                    {isParticipating(game) ? (
                      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
                        <FaCheck className="mr-2" />
                        Participated
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleJoinGame(game)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={game.isFull}
                      >
                        {game.isFull ? 'Game Full' : 'Join Game'}
                        {!game.isFull && <FaArrowRight className="ml-2" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinGame;
