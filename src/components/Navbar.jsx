import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Bell, User, LogOut, PlusCircle, 
  Calendar, Menu, X, Settings, Info, Mail 
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setIsLoggedIn(!!user));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Create Event', path: '/create-event', icon: <PlusCircle size={18} /> },
    { name: 'Manage', path: '/manage-events', icon: <Calendar size={18} /> },
    { name: 'Notifications', path: '/notification', icon: <Bell size={18} /> },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/10' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#ccff00] p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Trophy className="text-black" size={22} strokeWidth={3} />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white">
            CAMPUS<span className="text-[#ccff00]">LEAGUE</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#ccff00] ${
                      location.pathname === link.path ? 'text-[#ccff00]' : 'text-gray-400'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="h-8 w-[1px] bg-white/10 mx-2" />

              <Link to="/form" className="group flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#ccff00]/20 p-0.5 group-hover:border-[#ccff00] transition-colors">
                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                    <User size={18} className="text-gray-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:bg-[#ccff00] transition-colors active:scale-95"
            >
              SIGN IN
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[-1] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-[80%] bg-[#111] border-l border-white/10 p-8 z-[100] md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <span className="text-2xl font-black italic tracking-tighter">MENU</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {isLoggedIn ? (
                    <>
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ccff00]/50 text-lg font-bold italic"
                        >
                          <span className="text-[#ccff00]">{link.icon}</span>
                          {link.name}
                        </Link>
                      ))}
                      <div className="my-4 border-t border-white/5" />
                      <Link to="/form" className="flex items-center gap-4 p-4 text-gray-400 font-bold italic">
                        <User size={20} /> PROFILE
                      </Link>
                      <Link to="/settings" className="flex items-center gap-4 p-4 text-gray-400 font-bold italic">
                        <Settings size={20} /> SETTINGS
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 p-4 text-red-500 font-bold italic mt-auto"
                      >
                        <LogOut size={20} /> LOGOUT
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login"
                      className="bg-[#ccff00] text-black p-5 rounded-2xl text-center font-black italic text-xl"
                    >
                      SIGN IN NOW
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;