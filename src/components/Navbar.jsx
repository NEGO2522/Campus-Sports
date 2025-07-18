import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { FaHome, FaUser, FaSignOutAlt, FaPlusCircle, FaUsers, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              Sports Connect
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
              to="/explore"
              className={`${isActive('/explore')} text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center`}
            >
              <FaUsers className="mr-2" />
              Explore
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
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-md mt-2">
          <Link
            to="/dashboard"
            className={`${isActive('/dashboard')} flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50`}
            onClick={toggleMenu}
          >
            <FaHome className="mr-3 text-gray-500" />
            Dashboard
          </Link>
          
          <Link
            to="/create-event"
            className={`${isActive('/create-event')} flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50`}
            onClick={toggleMenu}
          >
            <FaPlusCircle className="mr-3 text-gray-500" />
            Create Event
          </Link>
          
          <Link
            to="/explore"
            className={`${isActive('/explore')} flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50`}
            onClick={toggleMenu}
          >
            <FaUsers className="mr-3 text-gray-500" />
            Explore
          </Link>
          
          <Link
            to="/profile"
            className={`${isActive('/profile')} flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50`}
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
              className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 flex items-center"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
