import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUserFriends, FaStar, FaMapMarkerAlt, FaRunning, FaSpinner } from 'react-icons/fa';
import { collection, query, where, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { formatDistanceToNow } from 'date-fns';

const FindPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Levels');

  // Fetch players who are participants in any game
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('Starting to fetch players...');
        
        // First, get all events to find participants
        const eventsQuery = query(collection(db, 'events'));
        console.log('Fetching events...');
        const eventsSnapshot = await getDocs(eventsQuery);
        
        if (eventsSnapshot.empty) {
          console.log('No events found in the database');
          setPlayers([]);
          setLoading(false);
          return;
        }
        
        console.log(`Found ${eventsSnapshot.size} events`);
        
        // Get all unique participant IDs
        const participantIds = new Set();
        eventsSnapshot.forEach(doc => {
          const eventData = doc.data();
          console.log(`Event ${doc.id} data:`, eventData);
          
          if (eventData.participants && Array.isArray(eventData.participants)) {
            console.log(`Event ${doc.id} has ${eventData.participants.length} participants`);
            eventData.participants.forEach(participantId => {
              participantIds.add(participantId);
            });
          } else {
            console.log(`Event ${doc.id} has no participants array`);
          }
        });

        console.log('All participant IDs:', Array.from(participantIds));

        // Convert Set to array and remove current user
        const currentUser = auth.currentUser;
        const currentUserId = currentUser?.uid;
        console.log('Current user ID:', currentUserId);
        
        const playerIds = Array.from(participantIds).filter(id => id && id !== currentUserId);
        console.log('Player IDs to fetch:', playerIds);

        if (playerIds.length === 0) {
          console.log('No players found in any events after filtering');
          setPlayers([]);
          setLoading(false);
          return;
        }

        // Get user data for each participant
        console.log('Fetching user data for players...');
        
        // First, try to get users by their UID directly from the document ID
        const usersPromises = playerIds.map(async (uid) => {
          try {
            // First try to get the user document where the document ID matches the UID
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              return { id: userDoc.id, ...userDoc.data() };
            }
            
            // If not found, try querying by uid field as fallback
            const userQuery = query(
              collection(db, 'users'),
              where('uid', '==', uid)
            );
            const querySnapshot = await getDocs(userQuery);
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              return { id: userDoc.id, ...userDoc.data() };
            }
            
            console.log(`User with ID ${uid} not found`);
            return null;
          } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
            return null;
          }
        });

        // Wait for all user data to be fetched
        const usersData = (await Promise.all(usersPromises)).filter(Boolean);
        
        console.log('Fetched users data:', usersData);
        
        // Log the raw user data for debugging
        console.log('Raw user data from Firestore:', usersData);
        
        // Process the user data with better field mapping
        const playersData = usersData.map(userData => {
          // Log each user's data for debugging
          console.log(`Processing user data for ${userData.id || 'unknown'}:`, userData);
          
          // Get the best available name with proper fallbacks
          const name = userData.fullName || 
                      userData.displayName || 
                      userData.name || 
                      userData.email?.split('@')[0] || 
                      'Player ' + (userData.id || '').substring(0, 6);
          
          // Get sports information with proper fallbacks
          let sports = [];
          if (Array.isArray(userData.selectedSports)) {
            sports = userData.selectedSports;
          } else if (Array.isArray(userData.sports)) {
            sports = userData.sports;
          } else if (userData.sport) {
            sports = [userData.sport];
          } else if (userData.events) {
            // Extract sports from events as a last resort
            const sportsFromEvents = userData.events
              .map(event => event.sport)
              .filter(Boolean);
            sports = [...new Set(sportsFromEvents)]; // Remove duplicates
          }
          if (sports.length === 0) sports = ['General'];
          
          // Ensure sports is an array of strings
          sports = sports.map(sport => 
            typeof sport === 'string' ? sport : 
            sport && typeof sport.name === 'string' ? sport.name : 
            'General'
          ).filter(Boolean);
          
          // Create the player object with fallbacks
          return {
            id: userData.id,
            uid: userData.uid || userData.id,
            name: name,
            email: userData.email || '',
            sports: sports,
            location: userData.location || userData.city || 'Location not specified',
            rating: userData.rating || 0,
            matches: userData.matchesPlayed || userData.matches || 0,
            skill: userData.skillLevel || userData.skill || 'Not specified',
            availability: userData.availability || 'Not specified',
            lastActive: userData.lastActive ? 
              (userData.lastActive.toDate ? 
                formatDistanceToNow(userData.lastActive.toDate(), { addSuffix: true }) : 
                formatDistanceToNow(new Date(userData.lastActive), { addSuffix: true })) : 
              'Recently',
            image: userData.photoURL || 
                  userData.photoUrl || 
                  userData.image || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            // Include raw data for debugging
            _rawData: userData
          };
        });
        
        console.log('Processed players data:', playersData);
        setPlayers(playersData);
        setLoading(false);
        
        // Set up individual document listeners for each player
        // This is more reliable than using 'in' with real-time updates
        const unsubscribes = [];
        
        const setupRealTimeListeners = () => {
          // First, clear any existing listeners
          unsubscribes.forEach(unsubscribe => unsubscribe());
          unsubscribes.length = 0;
          
          // Set up a listener for each player
          playerIds.forEach(uid => {
            // Try direct document reference first
            const userDocRef = doc(db, 'users', uid);
            const unsubscribe = onSnapshot(
              userDocRef,
              (docSnapshot) => {
                if (!docSnapshot.exists()) {
                  console.log(`User ${uid} not found in real-time update`);
                  return;
                }
                
                const userData = docSnapshot.data();
                console.log('Real-time update for user:', userData);
                
                setPlayers(prevPlayers => {
                  // Create a map of existing players for easy updates
                  const playersMap = new Map(prevPlayers.map(p => [p.uid, p]));
                  
                  // Process sports array
                  let sports = [];
                  if (Array.isArray(userData.selectedSports)) {
                    sports = userData.selectedSports;
                  } else if (Array.isArray(userData.sports)) {
                    sports = userData.sports;
                  } else if (userData.sport) {
                    sports = [userData.sport];
                  } else {
                    sports = ['General'];
                  }
                  
                  // Ensure sports is an array of strings
                  sports = sports.map(sport => 
                    typeof sport === 'string' ? sport : 
                    sport && typeof sport.name === 'string' ? sport.name : 
                    'General'
                  ).filter(Boolean);
                  
                  // Get the best available name
                  const name = userData.fullName || 
                             userData.displayName || 
                             userData.name || 
                             'Player ' + (docSnapshot.id || '').substring(0, 6);
                  
                  // Update or add the player with all fields
                  const updatedPlayer = {
                    id: docSnapshot.id,
                    uid: userData.uid || docSnapshot.id,
                    name: name,
                    email: userData.email || '',
                    sports: sports,
                    location: userData.location || userData.city || 'Location not specified',
                    experience: userData.experienceLevel || 'Not specified',
                    age: userData.age || 'Not specified',
                    gender: userData.gender || 'Not specified',
                    skill: userData.skillLevel || userData.skill || 'Not specified',
                    rating: userData.rating || 0,
                    matches: userData.matchesPlayed || userData.matches || 0,
                    availability: userData.availability || 'Not specified',
                    courseName: userData.courseName || 'Not specified',
                    registrationNumber: userData.registrationNumber || 'Not provided',
                    lastActive: userData.lastActive ? 
                      (userData.lastActive.toDate ? 
                        formatDistanceToNow(userData.lastActive.toDate(), { addSuffix: true }) : 
                        formatDistanceToNow(new Date(userData.lastActive), { addSuffix: true })) : 
                      'Recently',
                    image: userData.photoURL || 
                          userData.photoUrl || 
                          userData.image || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                    // Keep raw data for debugging
                    _rawData: userData
                  };
                  
                  console.log('Updating player data with:', {
                    courseName: updatedPlayer.courseName,
                    registrationNumber: updatedPlayer.registrationNumber
                  });
                  
                  playersMap.set(uid, updatedPlayer);
                  
                  // Convert back to array
                  return Array.from(playersMap.values());
                });
              },
              (error) => {
                console.error(`Error in real-time listener for user ${uid}:`, error);
              }
            );
            
            unsubscribes.push(unsubscribe);
          });
        };
        
        // Initial setup of listeners
        setupRealTimeListeners();
        
        // Create a single unsubscribe function for all listeners
        const unsubscribe = () => {
          unsubscribes.forEach(fn => fn());
        };

        // Cleanup subscription on unmount
        return () => {
          console.log('Cleaning up player data listener');
          unsubscribe();
        };
      } catch (error) {
        console.error('Error in fetchPlayers:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener to ensure we have the current user
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User authenticated, fetching players...');
        fetchPlayers();
      } else {
        console.log('No user signed in');
        setLoading(false);
      }
    });

    // Cleanup auth listener on unmount
    return () => {
      console.log('Cleaning up auth listener');
      unsubscribeAuth();
    };
  }, []);

  const filteredPlayers = players.filter(player => {
    return (
      (sportFilter === 'All Sports' || player.sports.some(sport => 
        sport.toLowerCase().includes(sportFilter.toLowerCase())
      )) &&
      (locationFilter === '' || player.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (skillFilter === 'All Levels' || player.skill === skillFilter)
    );
  });

  const sports = ['All Sports', 'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Table Tennis'];
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 col-span-3">
          <FaUserFriends className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No players found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player, index) => {
            // Get the raw user data (use player data directly as it already has the mapped fields)
            const userData = {
              ...player._rawData,  // Keep raw data for debugging
              ...player           // Use the processed player data
            };
            
            // Extract the player information with proper fallbacks
            const name = player.name || userData.fullName || `Player ${player.id.substring(0, 6)}`;
            const sports = Array.isArray(player.sports) ? player.sports : 
                         (userData.selectedSports || userData.sports || ['General']);
            
            const experience = player.experience || userData.experienceLevel || 'Not specified';
            const age = player.age ? `${player.age}` : (userData.age ? `${userData.age}` : 'Not specified');
            const gender = (player.gender || userData.gender || '').toString();
            const formattedGender = gender ? 
              gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : 
              'Not specified';
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="relative">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
                        alt={name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-green-100"
                      />
                      {userData.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {sports.map((sport, i) => {
                          const sportName = typeof sport === 'string' ? sport : (sport?.name || 'Sport');
                          return (
                            <span 
                              key={i}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {sportName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Experience</p>
                        <p className="font-medium">{experience || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">{age || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="font-medium">{formattedGender}</p>
                      </div>
                    </div>
                    
                    {/* Course and Registration Info - More Prominent Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Academic Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Course:</span>
                          <span className="text-sm text-gray-700">
                            {player.courseName !== 'Not specified' ? player.courseName : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Registration No:</span>
                          <span className="text-sm text-gray-700">
                            {player.registrationNumber !== 'Not provided' ? player.registrationNumber : 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location and Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{player.location}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <div className="flex items-center text-yellow-500">
                          <FaStar className="mr-1" />
                          <span>{player.rating.toFixed(1)}</span>
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-gray-500">
                          {player.matches} {player.matches === 1 ? 'match' : 'matches'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Invite to Play
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FindPlayers;
