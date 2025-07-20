import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { FaHome, FaUser, FaSignOutAlt, FaPlusCircle, FaUsers, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    <>
      {/* Blur overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}
      
      <nav className="w-full relative z-50 bg-transparent md:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 bg-transparent">
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
            
            <Link
              to="/create-event"
              className={`${isActive('/create-event')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
            >
              <FaPlusCircle className="mr-2" />
              Create Event
            </Link>
            
            <Link
              to="/join-game"
              className={`${isActive('/join-game')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
            >
              <FaUsers className="mr-2" />
              Explore Games
            </Link>
            
            <Link
              to="/profile"
              className={`${isActive('/profile')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
            >
              <FaUser className="mr-2" />
              Profile
            </Link>
          </div>

          {/* Logout Button - Desktop */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
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
      <div className={`fixed inset-0 top-16 bottom-0 left-0 right-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 md:hidden`}>
        <div className="h-full overflow-y-auto bg-white/10 backdrop-blur-lg">
          <Link
            to="/dashboard"
            className={`${isActive('/dashboard')} flex items-center px-4 py-3 text-base font-medium text-white hover:bg-white/20`}
            onClick={toggleMenu}
          >
            <FaHome className="mr-3 text-gray-500" />
            Dashboard
          </Link>
          
          <Link
            to="/create-event"
            className={`${isActive('/create-event')} flex items-center px-4 py-3 text-base font-medium text-white hover:bg-white/20`}
            onClick={toggleMenu}
          >
            <FaPlusCircle className="mr-3 text-gray-500" />
            Create Event
          </Link>
          
          <Link
            to="/join-game"
            className={`${isActive('/join-game')} flex items-center px-4 py-3 text-base font-medium text-white hover:bg-white/20`}
            onClick={toggleMenu}
          >
            <FaUsers className="mr-3 text-gray-500" />
            Explore Games
          </Link>
          
          <Link
            to="/profile"
            className={`${isActive('/profile')} flex items-center px-4 py-3 text-base font-medium text-white hover:bg-white/20`}
            onClick={toggleMenu}
          >
            <FaUser className="mr-3 text-gray-500" />
            Profile
          </Link>
          
          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:bg-white/10 flex items-center"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
};

export default Navbar;
