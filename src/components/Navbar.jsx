import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { FaHome, FaUser, FaSignOutAlt, FaPlusCircle, FaUsers, FaBars, FaTimes, FaEdit, FaCalendarAlt, FaCog, FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role from sessionStorage on component mount
  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const toggleMenu = () => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    
    // Toggle overflow hidden on body when menu is open/closed
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

  // Clean up the effect when component unmounts
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
            
            <Link
              to="/join-game"
              className={`${isActive('/join-game')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
            >
              <FaUsers className="mr-2" />
              Explore Games
            </Link>
            
            {userRole === 'player' && (
              <Link
                to="/find-players"
                className={`${isActive('/find-players')} block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                onClick={toggleMenu}
              >
                <FaSearch className="inline-block mr-2" />
                Find Players
              </Link>
            )}
          </div>

          {/* Profile Dropdown - Desktop */}
          <div className="hidden md:ml-6 md:flex md:items-center relative">
            <button
              onClick={toggleProfile}
              className="p-1 rounded-full text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaUser className="h-6 w-6" />
            </button>
            
            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 profile-dropdown">
                <div className="py-1" role="none">
                  <Link
                    to="/form"
                    onClick={() => setIsProfileOpen(false)}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaEdit className="mr-2 text-gray-500" />
                    Edit Interested Sports
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left text-red-600 block px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

          {/* Mobile menu, show/hide based on menu state */}
      <div 
        className={`fixed inset-0 top-16 bottom-0 left-0 right-0 transform ${
          isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        } transition-all duration-300 ease-in-out z-40 md:hidden`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="h-full overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={`${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-100 hover:bg-white/10'
              } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200`}
              onClick={toggleMenu}
            >
              <FaHome className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500" />
              Dashboard
            </Link>

            {userRole === 'organizer' && (
              <>
                <Link
                  to="/create-event"
                  className={`${
                    isActive('/create-event')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-100 hover:bg-white/10'
                  } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200`}
                  onClick={toggleMenu}
                >
                  <FaPlusCircle className="mr-3 flex-shrink-0 h-6 w-6 text-green-500" />
                  Create Event
                </Link>
                <Link
                  to="/manage-events"
                  className={`${
                    isActive('/manage-events')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-100 hover:bg-white/10'
                  } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200`}
                  onClick={toggleMenu}
                >
                  <FaCog className="mr-3 flex-shrink-0 h-6 w-6 text-orange-500" />
                  Manage Events
                </Link>
              </>
            )}

            <Link
              to="/join-game"
              className={`${
                isActive('/join-game')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-100 hover:bg-white/10'
              } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200`}
              onClick={toggleMenu}
            >
              <FaUsers className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500" />
              Explore Games
            </Link>

            {userRole === 'player' && (
              <Link
                to="/find-players"
                className={`${
                  isActive('/find-players')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-100 hover:bg-white/10'
                } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200`}
                onClick={toggleMenu}
              >
                <FaSearch className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500" />
                Find Players
              </Link>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="space-y-1">
              <Link
                to="/form"
                className="group flex items-center px-4 py-3 text-base font-medium text-gray-100 hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                <FaEdit className="mr-3 flex-shrink-0 h-6 w-6 text-amber-500" />
                Edit Interested Sports
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="w-full group flex items-center px-4 py-3 text-base font-medium text-red-400 hover:bg-red-900/20 rounded-md transition-colors duration-200 text-left"
              >
                <FaSignOutAlt className="mr-3 flex-shrink-0 h-6 w-6" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default Navbar;
