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
    
    // Keep track of all unsubscribe functions
    const unsubscribeFunctions = [];
    let pendingInvitesCount = 0;
    const eventListeners = new Map();
    
    // Function to update the unread count
    const updateUnreadCount = () => {
      let totalCount = 0;
      eventListeners.forEach(count => totalCount += count);
      setUnreadCount(totalCount);
    };
    
    // First, get all events and set up listeners for each
    const eventsQuery = query(collection(db, 'events'));
    
    const unsubscribeEvents = onSnapshot(eventsQuery, (eventsSnapshot) => {
      // Clean up existing team listeners for removed events
      const currentEventIds = new Set(eventsSnapshot.docs.map(doc => doc.id));
      
      eventListeners.forEach((count, eventId) => {
        if (!currentEventIds.has(eventId)) {
          eventListeners.delete(eventId);
        }
      });
      
      // Set up listeners for each event's team subcollection
      eventsSnapshot.docs.forEach(eventDoc => {
        const eventId = eventDoc.id;
        
        // Skip if we already have a listener for this event
        if (eventListeners.has(eventId)) return;
        
        // Initialize count for this event
        eventListeners.set(eventId, 0);
        
        // Set up real-time listener for this event's team invitations
        const teamQuery = query(
          collection(db, 'events', eventId, 'team'),
          where('invitee', '==', userId),
          where('accepted', '==', false)
        );
        
        const unsubscribeTeam = onSnapshot(teamQuery, (teamSnapshot) => {
          // Update count for this specific event
          eventListeners.set(eventId, teamSnapshot.size);
          updateUnreadCount();
        }, (error) => {
          console.error(`Error listening to team invites for event ${eventId}:`, error);
          // Set count to 0 for this event if there's an error
          eventListeners.set(eventId, 0);
          updateUnreadCount();
        });
        
        unsubscribeFunctions.push(unsubscribeTeam);
      });
      
      updateUnreadCount();
    }, (error) => {
      console.error('Error listening to events:', error);
    });
    
    unsubscribeFunctions.push(unsubscribeEvents);

    // Clean up all subscriptions on unmount
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
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

  // Close profile dropdown when clicking outside (fix: allow clicks inside button and dropdown)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.profile-dropdown');
      const button = document.querySelector('.profile-btn');
      if (
        isProfileOpen &&
        dropdown &&
        !dropdown.contains(event.target) &&
        button &&
        !button.contains(event.target)
      ) {
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
              {/* Notification Bell */}
              <div className="relative mr-4">
                <Link
                  to="/notification"
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative inline-block transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
              
              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="profile-btn flex items-center space-x-2 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                    <FaUser className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                  <svg 
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown menu */}
                {isProfileOpen && (
                  <div 
                    className="profile-dropdown absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] overflow-hidden transition-all duration-200 transform origin-top-right"
                    style={{ transform: isProfileOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)', opacity: isProfileOpen ? 1 : 0, pointerEvents: 'auto' }}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        to="/form" 
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        <FaEdit className="mr-3 text-gray-400 group-hover:text-blue-500" />
                        Edit Profile
                      </Link>
                      <Link 
                        to="/about" 
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        <FaInfoCircle className="mr-3 text-gray-400 group-hover:text-blue-500" />
                        About
                      </Link>
                      <Link 
                        to="/contact" 
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        <FaEnvelope className="mr-3 text-gray-400 group-hover:text-blue-500" />
                        Contact Us
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center"
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                        role="menuitem"
                      >
                        <FaSignOutAlt className="mr-3 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-900">Your Participation</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 -mr-2"
                  onClick={() => setShowParticipation(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
              {loadingParticipation ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : participationData.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <FaTrophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No participation found</p>
                  <p className="text-sm mt-1">Join or create a team to see your participation here</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto w-full">
                  <ul className="space-y-4">
                    {participationData.map((item, idx) => (
                      item.type === 'team' ? (
                        <li key={item.eventId + item.teamName} className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100 relative">
                          {/* Pencil Button - only for leader */}
                          {item.leader === currentUid && (
                            <button
                              className="absolute top-3 right-3 p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              title="Edit Team"
                              onClick={() => handleEditTeam(item.eventId)}
                              aria-label="Edit team"
                            >
                              <FaPencilAlt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="font-semibold text-blue-900 text-base mb-1 pr-6">{item.eventName}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div className="text-gray-700">Team:</div>
                            <div className="font-medium text-gray-900">{item.teamName}</div>
                            
                            <div className="text-gray-700">Role:</div>
                            <div className="font-medium text-gray-900">
                              {item.leader === currentUid ? 'Team Leader' : 'Team Member'}
                            </div>
                            
                            <div className="text-gray-700">Members:</div>
                            <div className="space-y-1">
                              {[item.leaderName, ...item.memberNames.filter(name => name !== item.leaderName)].map((member, i) => (
                                <div key={member + i} className="flex items-center">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${member === item.leaderName ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                  <span className={member === item.leaderName ? 'font-medium text-blue-700' : 'text-gray-700'}>
                                    {member} {member === item.leaderName && '(Leader)'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      ) : (
                        <li key={item.eventId + 'individual'} className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100">
                          <div className="font-semibold text-green-900 text-base mb-1">{item.eventName}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div className="text-gray-700">Participation:</div>
                            <div className="font-medium text-gray-900">Individual</div>
                            
                            <div className="text-gray-700">Status:</div>
                            <div className="font-medium text-green-700">Registered</div>
                          </div>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
              </div>
              
              {/* Footer */}
              <div className="bg-white border-t border-gray-200 p-4 flex justify-end">
                <button
                  onClick={() => setShowParticipation(false)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;