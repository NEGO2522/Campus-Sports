import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaTrophy, FaCalendarPlus, FaClipboardList,
  FaBolt, FaInstagram, FaTwitter, FaDiscord, FaRunning, FaHistory
} from 'react-icons/fa';
import { MapPin, BookOpen, Star, Bell, Settings, ChevronRight, Zap, Users } from 'lucide-react';
import UpcomingEvents from './UpcomingEvents';
import OngoingEvents from './OngoingEvents';
import Leaderboard from './Leaderboard';
import PastEvents from './PastEvents';
import { getUser } from '../utils/auth';
import api from '../utils/api';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const localUser = getUser();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.get('/users/me');
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name || localUser?.fullName || 'Athlete';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-[#ccff00] font-bold uppercase tracking-widest text-[10px] mb-3">
            <FaBolt className="animate-pulse" />
            <span>System Active</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
                Hey, <span className="text-[#ccff00]">{firstName}</span>
              </h1>
              <p className="mt-2 text-gray-500 font-medium text-sm tracking-wide">
                {profile?.college_name ? `${profile.college_name} • ${profile.city}` : 'Ready to play?'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/notification" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-all text-gray-400">
                <Bell size={18} />
              </Link>
              <Link to="/form" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-all text-gray-400">
                <Settings size={18} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-[#111] border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ccff00]/5 blur-3xl rounded-full" />

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#ccff00] flex items-center justify-center text-black font-black text-3xl italic flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white leading-tight">{displayName}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{profile?.email || localUser?.email}</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10 mb-5">
              {[
                { icon: MapPin, label: 'College', value: profile?.college_name },
                { icon: BookOpen, label: 'Course', value: profile?.course_name },
                { icon: Star, label: 'Reg. No', value: profile?.registration_number },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                  <item.icon size={14} className="text-[#ccff00] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-white truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {profile?.sport_preferences?.length > 0 && (
              <div className="relative z-10 mb-5">
                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2">Sports</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.sport_preferences.map(sport => (
                    <span key={sport} className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] rounded-lg">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="relative z-10 bg-[#ccff00] rounded-2xl p-4 flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Total Points</p>
                <p className="text-4xl font-black italic text-black">{profile?.points || 0}</p>
              </div>
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
                <FaTrophy size={24} className="text-black" />
              </div>
            </div>

            <Link to="/form" className="relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-all">
              Edit Profile <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Right side grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sm:col-span-2">
              <Link to="/create-event" className="group relative flex items-center justify-between bg-[#ccff00] hover:bg-[#d9ff33] transition-all rounded-3xl p-7 overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-full bg-black/5 skew-x-[-15deg] translate-x-16 group-hover:translate-x-10 transition-all" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50 mb-1">Start Something</p>
                  <h3 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-black">Create Event</h3>
                </div>
                <div className="relative z-10 w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaCalendarPlus size={28} className="text-black" />
                </div>
              </Link>
            </motion.div>

            {[
              { to: '/manage-events', icon: FaClipboardList, label: 'Your Events', title: 'Manage', delay: 0.15 },
              { to: '/leaderboard', icon: FaTrophy, label: 'Rankings', title: 'Leaderboard', delay: 0.2 },
              { to: '/notification', icon: Bell, label: 'Inbox', title: 'Notifications', delay: 0.25 },
            ].map((item) => (
              <motion.div key={item.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
                <Link to={item.to} className="group flex flex-col justify-between bg-[#111] border border-white/10 hover:border-[#ccff00]/40 transition-all rounded-3xl p-6 h-full min-h-[140px]">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#ccff00]/10 transition-all mb-4">
                    <item.icon size={20} className="text-gray-500 group-hover:text-[#ccff00] transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">{item.label}</p>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-[#ccff00] transition-colors">{item.title}</h4>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex flex-col justify-between bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-3xl p-6 h-full min-h-[140px]">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Users size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-400/60 uppercase font-bold tracking-widest mb-1">Your Campus</p>
                  <h4 className="text-lg font-black italic uppercase tracking-tighter text-blue-300 leading-tight">
                    {profile?.college_name?.split(' ').slice(0, 2).join(' ') || 'Campus'}
                  </h4>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── LIVE EVENTS ── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Live <span className="text-[#ccff00]">Now</span></h2>
            <div className="flex-1 h-px bg-white/10" />
            <div className="flex items-center gap-1.5 relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
              <div className="w-2 h-2 bg-red-500 rounded-full relative" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Live</span>
            </div>
          </div>
          <OngoingEvents />
        </section>

        {/* ── UPCOMING EVENTS ── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Upcoming <span className="text-[#ccff00]">Events</span></h2>
            <div className="flex-1 h-px bg-white/10" />
            <Link to="/create-event" className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest hover:underline flex items-center gap-1">
              + Create <ChevronRight size={12} />
            </Link>
          </div>
          <UpcomingEvents />
        </section>

        {/* ── LEADERBOARD ── */}
        <section className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-8 mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter"><span className="text-[#ccff00]">Hall</span> of Fame</h2>
            <Link to="/leaderboard" className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <Leaderboard initialLimit={5} />
        </section>

        {/* ── PAST EVENTS ── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <FaHistory size={14} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Past <span className="text-gray-500">Events</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">History</span>
          </div>
          <PastEvents />
        </section>

        {/* ── FOOTER ── */}
        <footer className="pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">
                Campus <span className="text-[#ccff00]">League.</span>
              </h3>
              <p className="text-gray-600 text-xs max-w-xs leading-relaxed">India ka pehla location-based college sports platform.</p>
              <div className="flex gap-3 mt-4">
                {[FaInstagram, FaTwitter, FaDiscord].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all rounded-lg text-gray-500">
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Platform</h4>
                <ul className="space-y-2 text-xs font-bold text-gray-600">
                  <li><Link to="/leaderboard" className="hover:text-[#ccff00] transition-colors">Rankings</Link></li>
                  <li><Link to="/create-event" className="hover:text-[#ccff00] transition-colors">Tournaments</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Legal</h4>
                <ul className="space-y-2 text-xs font-bold text-gray-600">
                  <li><Link to="/privacy-policy" className="hover:text-[#ccff00] transition-colors">Privacy</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-[#ccff00] transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
