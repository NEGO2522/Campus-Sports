import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FaHome, FaUser, FaSignOutAlt, FaPlusCircle, FaUsers, FaBars, FaTimes, FaEdit, FaCalendarAlt, FaCog, FaSearch, FaBell, FaTrophy, FaPencilAlt, FaInfoCircle, FaEnvelope } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showParticipation, setShowParticipation] = useState(false);
  const [participationData, setParticipationData] = useState([]);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [currentUid, setCurrentUid] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Set up real-time listener for unread invitations in team subcollections
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    setCurrentUid(userId);
    
    // Query all events
    const eventsQuery = query(collection(db, 'events'));
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(eventsQuery, async (eventsSnapshot) => {
      let pendingInvitesCount = 0;
      
      // Check each event's team subcollection for pending invites
      for (const eventDoc of eventsSnapshot.docs) {
        const teamQuery = query(
          collection(db, 'events', eventDoc.id, 'team'),
          where('invitee', '==', userId),
          where('accepted', '==', false)
        );
        
        try {
          const teamSnapshot = await getDocs(teamQuery);
          pendingInvitesCount += teamSnapshot.size;
        } catch (err) {
          console.error('Error checking team invites:', err);
        }
      }
      
      setUnreadCount(pendingInvitesCount);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Get user role from sessionStorage on component mount
  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const toggleMenu = () => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    if (newIsMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100';
  };

  // Participation Modal Logic
  const handleParticipationClick = async () => {
    setShowParticipation(true);
    setLoadingParticipation(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setParticipationData([]);
        setLoadingParticipation(false);
        return;
      }
      const eventsSnap = await getDocs(collection(db, 'events'));
      const userEvents = [];
      const userIdsSet = new Set();
      eventsSnap.forEach(eventDoc => {
        const eventData = eventDoc.data();
        // Team events
        if (eventData.team && typeof eventData.team === 'object') {
          Object.entries(eventData.team).forEach(([teamName, teamObj]) => {
            if (
              (Array.isArray(teamObj.members) && teamObj.members.includes(user.uid)) ||
              teamObj.leader === user.uid
            ) {
              userEvents.push({
                type: 'team',
                eventName: eventData.eventName || eventData.name || 'Unknown Event',
                eventId: eventDoc.id,
                teamName,
                leader: teamObj.leader,
                members: teamObj.members || [],
              });
              userIdsSet.add(teamObj.leader);
              (teamObj.members || []).forEach(m => userIdsSet.add(m));
            }
          });
        }
        // Individual events
        if (
          eventData.participationType !== 'team' &&
          Array.isArray(eventData.participants) &&
          eventData.participants.includes(user.uid)
        ) {
          userEvents.push({
            type: 'individual',
            eventName: eventData.eventName || eventData.name || 'Unknown Event',
            eventId: eventDoc.id,
            participant: user.uid
          });
          userIdsSet.add(user.uid);
        }
      });
      // Fetch user full names
      const userIdToName = {};
      if (userIdsSet.size > 0) {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(userDoc => {
          const d = userDoc.data();
          userIdToName[userDoc.id] = d.fullName || userDoc.id;
        });
      }
      // Map ids to names in participation data
      const participationWithNames = userEvents.map(ev => {
        if (ev.type === 'team') {
          return {
            ...ev,
            leaderName: userIdToName[ev.leader] || ev.leader,
            memberNames: ev.members.map(m => userIdToName[m] || m)
          };
        } else {
          return {
            ...ev,
            participantName: userIdToName[ev.participant] || ev.participant
          };
        }
      });
      setParticipationData(participationWithNames);
    } catch (err) {
      setParticipationData([]);
    } finally {
      setLoadingParticipation(false);
    }
  };

  // Handler for pencil click
  const handleEditTeam = (eventId) => {
    setShowParticipation(false);
    navigate(`/events/${eventId}/create-team`);
  };

  return (
    <div>
      {/* Mobile menu overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />
      <nav className="w-full relative z-50 bg-white shadow-sm md:shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
                Campus League
              </Link>
            </div>
            {/* Navigation Links - Desktop */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
              >
                <FaHome className="mr-2" />
                Dashboard
              </Link>
              {userRole === 'organizer' && (
                <>
                  <Link
                    to="/create-event"
                    className={`${isActive('/create-event')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
                  >
                    <FaPlusCircle className="mr-2" />
                    Create Event
                  </Link>
                  <Link
                    to="/manage-events"
                    className={`${isActive('/manage-events')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
                  >
                    <FaCog className="mr-2" />
                    Manage Events
                  </Link>
                </>
              )}
              {/* Participation Button */}
              <button
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                onClick={handleParticipationClick}
              >
                <FaTrophy className="mr-2" />
                Participation
              </button>
            </div>
            {/* Profile Dropdown - Desktop */}
            <div className="hidden md:ml-6 md:flex md:items-center relative">
              <div className="relative mr-10">
                <Link
                  to="/notification"
                  className="p-1 rounded-full text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative inline-block"
                  aria-label="Notifications"
                >
                  <FaBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>
              <button
                onClick={toggleProfile}
                
                className="p-1 rounded-full text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaUser className="h-6 w-6" />
              </button>
              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-50 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 profile-dropdown" style={{ transform: 'translateX(-10px)' }}>
                  <div className="py-1" role="none">
                    <Link to="/form" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                      <FaEdit className="mr-2" /> Edit Profile
                    </Link>
                    <Link to="/about" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                      <FaInfoCircle className="mr-2" /> About
                    </Link>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                      <FaEnvelope className="mr-2" /> Contact Us
                    </Link>
                    <button className="text-red-600 hover:bg-gray-100 py-2 rounded flex items-center w-full text-left" onClick={() => { handleLogout(); toggleMenu(); }}>
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Mobile menu button and notification */}
            <div className="md:hidden flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => navigate('/notification')}
                  className="text-gray-700 hover:text-blue-600 focus:outline-none relative p-1"
                >
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 w-full bg-white z-40 shadow-lg border-t border-gray-200 animate-slide-down">
            <div className="flex flex-col py-4 px-6 space-y-2">
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
                onClick={toggleMenu}
              >
                <FaHome className="mr-2" />
                Dashboard
              </Link>
              {userRole === 'organizer' && (
                <>
                  <Link
                    to="/create-event"
                    className={`${isActive('/create-event')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
                    onClick={toggleMenu}
                  >
                    <FaPlusCircle className="mr-2" />
                    Create Event
                  </Link>
                  <Link
                    to="/manage-events"
                    className={`${isActive('/manage-events')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
                    onClick={toggleMenu}
                  >
                    <FaCog className="mr-2" />
                    Manage Events
                  </Link>
                </>
              )}
              <button
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                onClick={() => { handleParticipationClick(); toggleMenu(); }}
              >
                <FaTrophy className="mr-2" />
                Participation
              </button>
              <Link to="/form" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                <FaEdit className="mr-2" /> Edit Profile
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                <FaInfoCircle className="mr-2" /> About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={toggleMenu}>
                <FaEnvelope className="mr-2" /> Contact Us
              </Link>
              <button className="text-red-600 hover:bg-gray-100 py-2 rounded flex items-center" onClick={() => { handleLogout(); toggleMenu(); }}>
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          </div>
        )}
        {/* Participation Modal */}
        {showParticipation && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowParticipation(false)}
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">Your Participation</h2>
              {loadingParticipation ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : participationData.length === 0 ? (
                <div className="text-center text-gray-500">No participation found.</div>
              ) : (
                <ul className="space-y-6">
                  {participationData.map((item, idx) => (
                    item.type === 'team' ? (
                      <li key={item.eventId + item.teamName} className="bg-blue-50 rounded-lg p-4 shadow flex flex-col relative">
                        {/* Pencil Button - only for leader */}
                        {item.leader === currentUid && (
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-blue-700"
                            title="Edit Team"
                            onClick={() => handleEditTeam(item.eventId)}
                          >
                            <FaPencilAlt />
                          </button>
                        )}
                        <div className="font-semibold text-blue-800 text-lg mb-1">{item.eventName}</div>
                        <div className="text-sm text-gray-700 mb-1">Team: <span className="font-bold">{item.teamName}</span></div>
                        <div className="text-sm text-gray-700 mb-1">Leader: <span className="font-bold">{item.leaderName}</span></div>
                        <div className="text-sm text-gray-700">Members:</div>
                        <ul className="ml-4 text-gray-600 text-sm list-disc">
                          {item.memberNames.map((member, i) => (
                            <li key={member + i}>{member}</li>
                          ))}
                        </ul>
                      </li>
                    ) : (
                      <li key={item.eventId + 'individual'} className="bg-green-50 rounded-lg p-4 shadow flex flex-col">
                        <div className="font-semibold text-green-800 text-lg mb-1">{item.eventName}</div>
                        <div className="text-sm text-gray-700">Participant: <span className="font-bold">{item.participantName}</span></div>
                      </li>
                    )
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;