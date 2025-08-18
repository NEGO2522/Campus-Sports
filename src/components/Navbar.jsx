import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { FaBell, FaUser, FaSignOutAlt, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

const Navbar = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnreadNotifications] = useState(false);
  const menuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`bg-white shadow-sm fixed w-full z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/"
              className="flex items-center space-x-2"
            >
              <GiSoccerBall className="text-2xl text-green-600" />
              <span className="text-xl font-bold text-gray-900">Campus League</span>
            </Link>
          </div>
          
          {/* Desktop Sign In Button */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            {!isLoggedIn ? (
              <Link 
                to="/login" 
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
          </div>
          
          {/* Mobile Menu Overlay */}
          {isLoggedIn && isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
          
          {/* Navigation - Only show when user is logged in */}
          {isLoggedIn && (
            <nav 
              className={`fixed md:relative top-0 left-0 h-full w-64 bg-white shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out z-50 ${
                isMenuOpen ? 'translate-x-0' : '-translate-x-full'
              } md:translate-x-0 md:flex md:items-center md:space-x-6 md:w-auto md:h-auto md:bg-transparent`}
              ref={menuRef}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b md:hidden">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto h-[calc(100vh-64px)] md:h-auto md:flex md:items-center">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 p-4 md:p-0">
                  <Link 
                    to="/create-event" 
                    className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors md:py-2 md:px-3 md:hover:bg-transparent"
                  >
                    <FaPlus className="mr-2" />
                    <span>Create Event</span>
                  </Link>
                  <Link 
                    to="/manage-events" 
                    className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors md:py-2 md:px-3 md:hover:bg-transparent"
                  >
                    <FaCalendarAlt className="mr-2" />
                    <span>Manage Events</span>
                  </Link>
                  
                  {/* Notifications */}
                  <Link 
                    to="/notification"
                    className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors md:py-2 md:px-2 md:hover:bg-transparent"
                    aria-label="Notifications"
                  >
                    <span className="relative">
                      <FaBell className="h-5 w-5" />
                      {hasUnreadNotifications && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                    </span>
                    <span className="ml-3 md:hidden">Notifications</span>
                  </Link>

                  {/* User Menu - Mobile Only */}
                  <div className="relative md:ml-2 md:hidden">
                    <div className="py-1">
                      <Link 
                        to="/form" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaUser className="mr-3 h-4 w-4 text-gray-500" />
                        Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="mr-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <Link 
                        to="/edit-profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </Link>
                      <Link 
                        to="/about" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About
                      </Link>
                      <Link 
                        to="/contact" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Us
                      </Link>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <FaSignOutAlt className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                  
                  {/* Desktop Profile Link */}
                  <div className="hidden md:block">
                    <Link 
                      to="/form" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-gray-500" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
