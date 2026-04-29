import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Bell, User, LogOut, PlusCircle, Calendar, Menu, X, LayoutDashboard, ChevronDown } from 'lucide-react';
import { isLoggedIn, clearAuth, getUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loggedInStatus = isLoggedIn();
    setLoggedIn(loggedInStatus);
    if (loggedInStatus) setUser(getUser());
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Create', path: '/create-event', icon: <PlusCircle size={16} /> },
    { name: 'Manage', path: '/manage-events', icon: <Calendar size={16} /> },
  ];

  const isActive = (path) => location.pathname === path;
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'py-2.5 bg-black/90 backdrop-blur-xl border-b border-white/5' : 'py-4 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-[#ccff00] p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <Trophy className="text-black" size={20} strokeWidth={3} />
          </div>
          <span className="text-lg font-black italic tracking-tighter text-white">
            CAMPUS<span className="text-[#ccff00]">LEAGUE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {loggedIn ? (
            <>
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive(link.path)
                      ? 'bg-[#ccff00]/10 text-[#ccff00]'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              <div className="w-px h-6 bg-white/10 mx-2" />

              {/* Profile dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                    profileOpen
                      ? 'border-[#ccff00]/50 bg-[#ccff00]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-[#ccff00] flex items-center justify-center text-black font-black text-xs">
                    {userInitial}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider max-w-[80px] truncate">
                    {user?.fullName?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs font-black text-white uppercase truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-600 truncate mt-0.5">{user?.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        <Link to="/form" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider">
                          <User size={15} />
                          Edit Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                          <LogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login"
              className="bg-[#ccff00] text-black px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#e6ff80] transition-all active:scale-95">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[-1] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-[75%] max-w-sm bg-[#0f0f0f] border-l border-white/10 p-6 z-[100] md:hidden flex flex-col"
            >
              {/* Mobile header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-[#ccff00] p-1 rounded-lg">
                    <Trophy className="text-black" size={16} strokeWidth={3} />
                  </div>
                  <span className="text-base font-black italic tracking-tighter">CAMPUSLEAGUE</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                  <X size={18} />
                </button>
              </div>

              {loggedIn ? (
                <>
                  {/* User card */}
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#ccff00] flex items-center justify-center text-black font-black text-lg flex-shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-white text-sm uppercase truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="flex flex-col gap-1 flex-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                          isActive(link.path)
                            ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className={isActive(link.path) ? 'text-[#ccff00]' : 'text-gray-600'}>
                          {link.icon}
                        </span>
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  {/* Bottom actions */}
                  <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2">
                    <Link to="/form" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm uppercase tracking-wider transition-all">
                      <User size={18} /> Edit Profile
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold text-sm uppercase tracking-wider transition-all">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}
                    className="bg-[#ccff00] text-black p-4 rounded-2xl text-center font-black italic text-lg uppercase tracking-tight">
                    Sign In Now
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
