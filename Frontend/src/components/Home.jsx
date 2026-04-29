import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { isLoggedIn } from '../utils/auth';
import api from '../utils/api';
import {
  Trophy, Users, Zap, Calendar, ArrowRight,
  Target, Activity, ChevronRight, Instagram, Linkedin,
  LayoutDashboard, PlusCircle, Bell, Settings,
  Play, MapPin, CheckCircle
} from 'lucide-react';
import Navbar from './Navbar';

/* ─────────────────────────────────
   DEMO SCREEN CONTENTS
─────────────────────────────────── */

function DashboardScreen() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] p-4 flex flex-col gap-3 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">⚡ System Active</p>
          <p className="text-lg font-black italic uppercase text-white leading-tight">Hey, <span className="text-[#ccff00]">Rahul</span></p>
        </div>
        <div className="flex gap-1.5">
          <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg"><Bell size={12} className="text-gray-500" /></div>
          <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg"><Settings size={12} className="text-gray-500" /></div>
        </div>
      </div>

      {/* profile card */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#ccff00] flex items-center justify-center text-black font-black text-base flex-shrink-0">R</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white uppercase truncate">Rahul Sharma</p>
          <p className="text-[10px] text-gray-500 truncate">IIT Delhi · B.Tech CSE</p>
        </div>
        <div className="bg-[#ccff00] rounded-lg px-2.5 py-1.5 text-center flex-shrink-0">
          <p className="text-[9px] font-bold text-black/60 uppercase leading-none">Points</p>
          <p className="text-base font-black italic text-black leading-tight">420</p>
        </div>
      </div>

      {/* create event banner */}
      <div className="bg-[#ccff00] rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Start Something</p>
          <p className="text-sm font-black italic uppercase text-black">Create Event</p>
        </div>
        <PlusCircle size={20} className="text-black" />
      </div>

      {/* quick tiles */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <LayoutDashboard size={13} />, label: 'Your Events', title: 'Manage' },
          { icon: <Bell size={13} />, label: 'Inbox', title: 'Notifications' },
        ].map(t => (
          <div key={t.title} className="bg-[#111] border border-white/10 rounded-xl p-2.5">
            <div className="text-gray-600 mb-2">{t.icon}</div>
            <p className="text-[9px] text-gray-600 uppercase font-bold">{t.label}</p>
            <p className="text-xs font-black italic uppercase text-white">{t.title}</p>
          </div>
        ))}
      </div>

      {/* live events */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-black italic uppercase text-white">Live <span className="text-[#ccff00]">Now</span></p>
          <div className="flex-1 h-px bg-white/5" />
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { sport: '🏏 Cricket', name: 'Inter-Dept Finals', teams: 'CSE vs ECE' },
            { sport: '⚽ Football', name: 'Campus Cup QF', teams: 'Mech vs Civil' },
          ].map(e => (
            <div key={e.name} className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-3 py-2">
              <span className="text-sm">{e.sport.split(' ')[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-white truncate">{e.name}</p>
                <p className="text-[9px] text-gray-500">{e.teams}</p>
              </div>
              <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">LIVE</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateEventScreen() {
  const fields = [
    { label: 'Event Name', value: 'Inter-Dept Cricket 2025' },
    { label: 'Sport', value: 'Cricket' },
    { label: 'Venue', value: 'Main Ground, IIT Delhi' },
    { label: 'Date', value: '15 May 2025' },
  ];
  return (
    <div className="w-full h-full bg-[#0a0a0a] p-4 flex flex-col gap-3 overflow-hidden">
      <div>
        <p className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">⚡ New Tournament</p>
        <p className="text-lg font-black italic uppercase text-white leading-tight">Create <span className="text-[#ccff00]">Event</span></p>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex flex-col gap-2.5">
        {fields.map(f => (
          <div key={f.label}>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">{f.label}</p>
            <div className="w-full px-3 py-2 rounded-lg border border-[#ccff00]/25 bg-[#ccff00]/5 text-xs font-bold text-white">
              {f.value}
            </div>
          </div>
        ))}

        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Format</p>
          <div className="flex gap-1.5">
            {['Knockout', 'Round Robin', 'League'].map((f, i) => (
              <div key={f} className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
                i === 0 ? 'border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]' : 'border-white/10 text-gray-600'
              }`}>{f}</div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Max Teams</p>
          <div className="flex gap-1.5">
            {['8', '16', '32'].map((n, i) => (
              <div key={n} className={`w-10 text-center py-1.5 rounded-lg text-[10px] font-black border ${
                i === 1 ? 'border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]' : 'border-white/10 text-gray-600'
              }`}>{n}</div>
            ))}
          </div>
        </div>

        <div className="bg-[#ccff00] rounded-lg py-2.5 text-center mt-1">
          <span className="text-[11px] font-black uppercase italic text-black tracking-wider">Publish Event →</span>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const notifs = [
    { icon: '🏆', title: 'Points Awarded!', msg: 'You earned 50 pts for Cricket win.', time: '2m ago', dot: 'bg-[#ccff00]' },
    { icon: '⚽', title: 'Match Scheduled', msg: 'CSE vs Mech on 16 May at 4 PM.', time: '1h ago', dot: 'bg-blue-400' },
    { icon: '👥', title: 'Team Joined', msg: 'Arjun joined your team CSE Titans.', time: '3h ago', dot: 'bg-green-400' },
    { icon: '📅', title: 'Starting Soon', msg: 'Football Inter-Dept in 30 minutes!', time: '5h ago', dot: 'bg-orange-400' },
    { icon: '🥇', title: 'Result Declared', msg: 'CSE Titans won Basketball QF.', time: '1d ago', dot: 'bg-purple-400' },
  ];
  return (
    <div className="w-full h-full bg-[#0a0a0a] p-4 flex flex-col gap-3 overflow-hidden">
      <div>
        <p className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">⚡ Updates</p>
        <p className="text-lg font-black italic uppercase text-white leading-tight">Your <span className="text-[#ccff00]">Inbox</span></p>
      </div>
      <div className="flex flex-col gap-2">
        {notifs.map((n, i) => (
          <motion.div
            key={n.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-3 py-2.5"
          >
            <span className="text-base flex-shrink-0">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-white truncate">{n.title}</p>
              <p className="text-[9px] text-gray-500 truncate">{n.msg}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[8px] text-gray-600">{n.time}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${n.dot}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   DEMO SHOWCASE  (split layout)
─────────────────────────────────── */
const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={14} />,
    headline: 'Your Sports Command Centre',
    desc: 'See live matches, manage your profile, track points, and jump into events — all from one sleek dashboard.',
    bullets: ['Live match updates in real-time', 'Personal stats & point tracker', 'Quick-access to all actions'],
    screen: <DashboardScreen />,
  },
  {
    id: 'create',
    label: 'Create Event',
    icon: <PlusCircle size={14} />,
    headline: 'Launch a Tournament in Minutes',
    desc: 'Set up your event, pick a format, define teams, and publish — it takes under 2 minutes from start to live.',
    bullets: ['Knockout, Round Robin or League', 'Automated bracket generation', 'Invite teams with one tap'],
    screen: <CreateEventScreen />,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell size={14} />,
    headline: 'Never Miss a Beat',
    desc: 'Get instant alerts for match schedules, results, team activity, and points awarded directly in your inbox.',
    bullets: ['Instant match & result alerts', 'Points awarded notifications', 'Team join & activity updates'],
    screen: <NotificationsScreen />,
  },
];

function DemoShowcase({ onEnter }) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTab(p => (p + 1) % TABS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const tab = TABS[activeTab];

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

      {/* ── LEFT: content ── */}
      <div className="flex flex-col gap-8">
        {/* tab pills */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 ${
                activeTab === i
                  ? 'bg-[#ccff00] text-black border-[#ccff00]'
                  : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* headline + desc */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
              {tab.headline}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {tab.desc}
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {tab.bullets.map(b => (
                <li key={b} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                  <CheckCircle size={16} className="text-[#ccff00] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={onEnter}
            className="flex items-center gap-2 bg-[#ccff00] text-black px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Play size={14} fill="currentColor" />
            Try It Live
          </button>
          {/* progress dots */}
          <div className="flex items-center gap-2">
            {TABS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`rounded-full transition-all duration-300 ${
                  activeTab === i ? 'w-5 h-2 bg-[#ccff00]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: browser mockup ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* ambient glow */}
        <div className="absolute -inset-6 bg-[#ccff00]/8 blur-3xl rounded-[2rem] pointer-events-none" />

        {/* browser chrome */}
        <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* top bar */}
          <div className="bg-[#161616] border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1 flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse flex-shrink-0" />
              <span className="text-[11px] text-gray-500 font-mono truncate">campusleague.in/{tab.id}</span>
            </div>
          </div>

          {/* screen */}
          <div className="relative h-[420px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {tab.screen}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────
   MAIN HOME COMPONENT
─────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentWord, setCurrentWord] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState({ athletes: null, events: null, sports: 20 });
  const [statsLoading, setStatsLoading] = useState(true);

  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: videoRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const words = ["VICTORY", "COMMUNITY", "GLORY", "LEAGUES"];
  const sportsImages = ["https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000&auto=format&fit=crop"];

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { setLoggedIn(isLoggedIn()); }, [pathname]);
  useEffect(() => {
    const interval = setInterval(() => setCurrentWord(prev => (prev + 1) % words.length), 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          api.get('/users/count'),
          api.get('/events/count')
        ]);
        setStats({
          athletes: usersRes.count || 0,
          events: eventsRes.count || 0,
          sports: 20 // Static count from CreateEvent.jsx
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Fallback to static values if API fails
        setStats({ athletes: 500, events: 50, sports: 20 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleAuthRedirect = () => navigate(loggedIn ? '/dashboard' : '/login');

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };
  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black font-sans overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00] opacity-[0.08] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-[0.08] blur-[120px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={containerVars} initial="hidden" animate="visible">
            <motion.div variants={itemVars} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Live Campus Updates</span>
            </motion.div>
            <motion.h1 variants={itemVars} className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-[0.9]">
              YOUR PATH TO <br />
              <AnimatePresence mode="wait">
                <motion.span key={currentWord}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }} className="text-[#ccff00] inline-block">
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </motion.h1>
            <motion.p variants={itemVars} className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl">
              The elite OS for campus sports. Organize tournaments, track stats, and build your legacy in one powerhouse platform.
            </motion.p>
            <motion.div variants={itemVars}>
              <button onClick={handleAuthRedirect}
                className="group bg-[#ccff00] text-black px-10 py-5 rounded-full font-black text-lg transition-transform hover:scale-105 flex items-center gap-2">
                {loggedIn ? 'ENTER DASHBOARD' : 'JOIN THE LEAGUE'} <ArrowRight size={20} />
              </button>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
            className="relative h-[400px] md:h-[550px] w-full">
            <div className="absolute inset-0 bg-[#111] rounded-[3rem] border border-white/10 rotate-3 scale-95 overflow-hidden" />
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden -rotate-2 border-2 border-[#ccff00]/30">
              <img src={sportsImages[0]} className="w-full h-full object-cover grayscale-[20%]" alt="Sports" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 bg-[#ccff00] text-black p-4 rounded-2xl flex items-center gap-3">
                <Trophy size={24} strokeWidth={3} />
                <span className="font-black italic text-sm uppercase">Active Season 2025</span>
              </div>
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-[#ccff00] rounded-full flex items-center justify-center text-black -rotate-12 shadow-xl">
              <Zap size={40} fill="currentColor" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <motion.div whileHover={{ y: -5 }} onClick={handleAuthRedirect}
            className="md:col-span-8 bg-[#111] border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group min-h-[400px] cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20"><Trophy size={200} /></div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-14 h-14 bg-[#ccff00] rounded-2xl flex items-center justify-center text-black mb-6"><Target size={28} /></div>
              <h3 className="text-4xl font-black mb-4 italic uppercase">Championship Management</h3>
              <p className="text-gray-400 max-w-md">Real-time brackets, automated scoring, and referee coordination.</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} onClick={handleAuthRedirect}
            className="md:col-span-4 bg-[#ccff00] rounded-[2rem] p-10 text-black flex flex-col justify-between min-h-[400px] cursor-pointer">
            <Users size={40} strokeWidth={3} />
            <div>
              <h3 className="text-3xl font-black italic mb-2 uppercase">Pro Rosters</h3>
              <p className="font-medium opacity-80 text-sm">Build your team, manage substitutions with ease.</p>
            </div>
          </motion.div>
          <div onClick={handleAuthRedirect} className="md:col-span-4 bg-[#111] border border-white/10 rounded-[2rem] p-8 hover:bg-[#161616] transition-colors min-h-[250px] flex flex-col justify-center cursor-pointer">
            <Activity className="text-[#ccff00] mb-6" size={32} />
            <h4 className="text-xl font-bold mb-2 italic uppercase">Live Analytics</h4>
            <p className="text-gray-500 text-sm">Deep dive into player stats after every match.</p>
          </div>
          <div onClick={handleAuthRedirect} className="md:col-span-4 bg-blue-600 rounded-[2rem] p-8 flex flex-col justify-between min-h-[250px] cursor-pointer">
            <Calendar size={32} />
            <div className="flex justify-between items-end">
              <h4 className="text-xl font-bold italic uppercase">Smart Scheduling</h4>
              <ChevronRight />
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-[#ccff00]">Product Preview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Built for <span className="text-[#ccff00]">Athletes.</span><br className="hidden sm:block" /> Designed for <span className="text-[#ccff00]">Speed.</span>
          </h2>
        </motion.div>

        <DemoShowcase onEnter={handleAuthRedirect} />
      </section>

      {/* PARALLAX VIDEO */}
      <section ref={videoRef} className="px-6 mb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="relative w-full h-[600px] rounded-[3rem] overflow-hidden border border-white/10">
          <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%]">
            <video src="/Campus Leauge Video.mp4" autoPlay loop muted playsInline
              className="w-full h-full object-cover scale-110 brightness-[0.4]" />
          </motion.div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              className="text-[#ccff00] text-5xl md:text-9xl font-black italic tracking-tighter uppercase text-center">
              CAMPUS LEAGUE
            </motion.h2>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-[#ccff00] rounded-[3rem] p-12 md:p-20 text-center text-black relative overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-black italic mb-8 relative z-10 uppercase tracking-tighter">Ready to Dominate?</h2>
          <button onClick={handleAuthRedirect}
            className="bg-black text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform relative z-10 uppercase italic">
            {loggedIn ? 'Go to Dashboard' : 'Create an Event Now'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-24 pb-10 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ccff00]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

            {/* Brand col */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#ccff00] p-2 rounded-xl">
                  <Zap className="text-black" size={22} fill="currentColor" />
                </div>
                <span className="text-2xl font-black italic uppercase tracking-tighter">Campus<span className="text-[#ccff00]">League</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                The elite OS for campus sports. Tournaments, teams, and titles — all in one platform.
              </p>
              {/* Socials */}
              <div className="flex gap-3">
                <a href="/" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all text-gray-400">
                  <Instagram size={18} />
                </a>
                <a href="https://www.linkedin.com/company/campusleauge" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all text-gray-400">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {/* Links col 1 */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Platform</p>
              <div className="flex flex-col gap-3">
                <Link to="/dashboard" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Dashboard</Link>
                <Link to="/create-event" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Create Event</Link>
                <Link to="/manage-events" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Manage Events</Link>
                <Link to="/notification" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Notifications</Link>
              </div>
            </div>

            {/* Links col 2 */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Company</p>
              <div className="flex flex-col gap-3">
                <Link to="/about" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">About Us</Link>
                <Link to="/contact" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Contact Us</Link>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-[#ccff00] text-sm font-medium transition-colors">Terms of Service</Link>
              </div>
            </div>

            {/* Newsletter / CTA col */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Join the League</p>
              <p className="text-gray-500 text-sm">Ready to compete? Create your account and start your first tournament today.</p>
              <button onClick={handleAuthRedirect}
                className="flex items-center justify-center gap-2 bg-[#ccff00] text-black px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#d9ff33] transition-all active:scale-95 w-full">
                <Zap size={14} fill="currentColor" />
                {loggedIn ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { key: 'athletes', label: 'Athletes' },
                  { key: 'events', label: 'Events' },
                  { key: 'sports', label: 'Sports' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/5 rounded-xl py-3 text-center">
                    {statsLoading ? (
                      <div className="h-5 w-12 bg-gray-700 rounded animate-pulse mx-auto" />
                    ) : (
                      <p className="text-[#ccff00] font-black text-lg leading-none">{stats[s.key]}+</p>
                    )}
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mb-8" />

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-700 font-medium">
              © {new Date().getFullYear()} CampusLeague. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
              <p className="text-[11px] text-gray-700 font-medium">Built for campus athletes</p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
