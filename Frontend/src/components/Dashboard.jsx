import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaTrophy, FaCalendarPlus, FaClipboardList, FaBolt, FaInstagram, FaTwitter, FaDiscord } from 'react-icons/fa';
import UpcomingEvents from './UpcomingEvents';
import OngoingEvents from './OngoingEvents';
import Leaderboard from './Leaderboard';
import { getUser } from '../utils/auth';

// No Firebase. Data will come from our backend API.

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { id: 1, name: 'Upcoming Events', value: '0', icon: FaCalendarAlt, changeType: 'neutral' },
    { id: 2, name: 'Your Points', value: '0', icon: FaTrophy, changeType: 'positive' },
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      // TODO: Fetch from backend
      // const events = await api.get('/events?status=upcoming');
      // const user = await api.get('/auth/me');
      // setStats([
      //   { ...stats[0], value: events.length.toString() },
      //   { ...stats[1], value: user.points.toString() },
      // ]);
      setIsLoading(false);
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ccff00] selection:text-black">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">

        {/* Header */}
        <div className="mb-10 px-2 sm:px-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-[#ccff00] font-bold uppercase tracking-widest text-[10px] mb-2">
              <FaBolt className="animate-pulse" />
              <span>System Active</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Dashboard<span className="text-[#ccff00]">.</span>
            </h1>
            <p className="mt-2 text-gray-400 font-medium tracking-tight">Welcome back! Here's the field report.</p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-4xl">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#0a0a0a] border border-white/10 p-6 rounded-none relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ccff00]/5 skew-x-[25deg] translate-x-8 -translate-y-8 group-hover:bg-[#ccff00]/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.name}</p>
                  <p className="text-5xl font-black italic mt-1 tracking-tighter group-hover:text-[#ccff00] transition-colors">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full transition-transform group-hover:scale-110 ${stat.changeType === 'positive' ? 'bg-[#ccff00] text-black' : 'bg-white/10 text-white'}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-2 px-2 sm:px-0">
            <span className="w-8 h-[2px] bg-[#ccff00]"></span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/create-event" className="group relative p-8 bg-[#ccff00] hover:bg-[#e1ff00] text-black overflow-hidden transition-all flex items-center justify-between">
              <span className="relative z-10 font-black uppercase italic text-2xl tracking-tighter">Create Event</span>
              <FaCalendarPlus className="text-3xl relative z-10 opacity-30 group-hover:scale-110 transition-transform" />
            </Link>
            <Link to="/manage-events" className="group p-8 bg-[#0a0a0a] border border-white/10 hover:border-[#ccff00] transition-all flex items-center justify-between">
              <span className="font-black uppercase italic text-2xl tracking-tighter group-hover:text-[#ccff00]">Manage</span>
              <FaClipboardList className="text-3xl text-gray-600 group-hover:text-[#ccff00] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-20">
          <section>
            <div className="flex items-center gap-4 mb-8 px-2 sm:px-0">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ongoing Events</h2>
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <div className="w-3 h-3 bg-[#ccff00] rotate-45"></div>
            </div>
            <OngoingEvents />
          </section>

          <section className="bg-[#050505] border border-white/5 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Leaderboard</h2>
              <Link to="/leaderboard" className="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <Leaderboard initialLimit={5} />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 px-2 sm:px-0">
            <div className="space-y-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                Campus <span className="text-[#ccff00]">League.</span>
              </h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-medium">
                The ultimate arena for competitive college sports.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all"><FaInstagram size={18} /></a>
                <a href="#" className="p-2 bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all"><FaTwitter size={18} /></a>
                <a href="#" className="p-2 bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all"><FaDiscord size={18} /></a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Platform</h4>
                <ul className="space-y-3 text-sm font-bold text-gray-500 uppercase tracking-tight">
                  <li><Link to="/leaderboard" className="hover:text-[#ccff00] transition-colors">Rankings</Link></li>
                  <li><Link to="/create-event" className="hover:text-[#ccff00] transition-colors">Tournaments</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Support</h4>
                <ul className="space-y-3 text-sm font-bold text-gray-500 uppercase tracking-tight">
                  <li><Link to="/privacy-policy" className="hover:text-[#ccff00] transition-colors">Privacy</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-[#ccff00] transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-6 border border-white/5 flex flex-col justify-between group">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ccff00] mb-2">Platform Status</h4>
                <p className="text-xl font-black italic uppercase tracking-tighter group-hover:text-[#ccff00] transition-colors">Systems Operational</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-[ping_2s_infinite]"></div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Server: Active</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
