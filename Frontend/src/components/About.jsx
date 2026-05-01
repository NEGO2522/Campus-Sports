import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Trophy, Users, Calendar, Activity,
  Code, School, Check, X, ArrowRight
} from 'lucide-react';
import {
  GiCricketBat, GiShuttlecock, GiBoxingGlove,
  GiTennisRacket, GiHockey, GiRunningShoe, GiKimono
} from 'react-icons/gi';
import {
  FaFutbol, FaBasketballBall, FaVolleyballBall,
  FaSwimmer, FaChess, FaGamepad, FaTableTennis
} from 'react-icons/fa';
import Navbar from './Navbar';

const comparisons = [
  { old: 'WhatsApp groups for fixtures',     now: 'Centralized match scheduling'    },
  { old: 'Paper-based brackets',             now: 'Auto-generated tournament trees' },
  { old: 'No one tracks scores properly',    now: 'Live match score updates'        },
  { old: 'Results lost in group chats',      now: 'Permanent event records'         },
  { old: 'Zero visibility for good players', now: 'Athlete profiles & stats page'   },
];

const features = [
  { icon: <Zap size={20} />,      title: 'Live Score Updates',  desc: 'Scores update in real-time. No more waiting for someone to post in the group.' },
  { icon: <Trophy size={20} />,   title: 'Auto Brackets',       desc: 'Tournament brackets generate automatically. Knockout or Round Robin, sorted.' },
  { icon: <Users size={20} />,    title: 'Team Management',     desc: 'Create teams, add players, manage rosters — all from one place.' },
  { icon: <School size={20} />,   title: 'Multi-College Ready', desc: 'Built to handle inter-college events, not just internal ones.' },
  { icon: <Calendar size={20} />, title: 'Smart Scheduling',    desc: 'Set your event once — participants get notified automatically.' },
  { icon: <Code size={20} />,     title: 'Built by a Student',  desc: 'Made by Kshitij Jain, 2nd year at Poornima University — who got tired of the chaos.' },
];

const sports = [
  { icon: <GiCricketBat size={26} />,     name: 'Cricket'      },
  { icon: <FaFutbol size={24} />,         name: 'Football'     },
  { icon: <FaBasketballBall size={24} />, name: 'Basketball'   },
  { icon: <GiShuttlecock size={26} />,    name: 'Badminton'    },
  { icon: <FaVolleyballBall size={24} />, name: 'Volleyball'   },
  { icon: <FaTableTennis size={24} />,    name: 'Table Tennis' },
  { icon: <GiTennisRacket size={26} />,   name: 'Tennis'       },
  { icon: <GiBoxingGlove size={26} />,    name: 'Boxing'       },
  { icon: <FaSwimmer size={24} />,        name: 'Swimming'     },
  { icon: <GiHockey size={26} />,         name: 'Hockey'       },
  { icon: <GiKimono size={26} />,         name: 'Kabaddi'      },
  { icon: <GiRunningShoe size={26} />,    name: 'Athletics'    },
  { icon: <FaChess size={24} />,          name: 'Chess'        },
  { icon: <FaGamepad size={24} />,        name: 'Esports'      },
  { icon: <GiShuttlecock size={26} />,    name: 'Kho-Kho'      },
  { icon: <Activity size={24} />,         name: '& More'       },
];

const testimonials = [
  {
    name: 'Kshitij Jain', college: 'Poornima University, Jaipur',
    sport: 'Founder', initials: 'KJ', role: 'Founder',
    quote: 'I built Campus League because every sports event at our college was a mess — wrong fixtures, missing scores, no records. I wanted to fix that. So I did.',
  },
  {
    name: 'A Fellow Organizer', college: 'Engineering College, Rajasthan',
    sport: 'Cricket', initials: 'FO', role: 'Event Organizer',
    quote: 'Managing 12 cricket teams across 3 days used to mean 6 spreadsheets and 4 WhatsApp groups. Campus League replaced all of that.',
  },
  {
    name: 'A Campus Athlete', college: 'University, India',
    sport: 'Football', initials: 'CA', role: 'Team Captain',
    quote: "For the first time, I could actually see my team's match history and standings without asking anyone. That's what this platform gets right.",
  },
  {
    name: 'A Sports Secretary', college: 'College, India',
    sport: 'Basketball', initials: 'SS', role: 'Sports Secretary',
    quote: 'Announcing schedules used to take me an hour. Now I set it up once, and every participant gets notified automatically.',
  },
];

const About = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState([
    { number: '...', label: 'Athletes'  },
    { number: '...', label: 'Events'    },
    { number: '...', label: 'Colleges'  },
    { number: '...', label: 'Matches'   },
  ]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/stats`)
      .then(r => r.json())
      .then(data => {
        setStats([
          { number: `${data.athletes ?? 0}+`, label: 'Athletes'  },
          { number: `${data.events   ?? 0}+`, label: 'Events'    },
          { number: `${data.colleges ?? 0}+`, label: 'Colleges'  },
          { number: `${data.matches  ?? 0}+`, label: 'Matches'   },
        ]);
      })
      .catch(() => {
        setStats([
          { number: '0+', label: 'Athletes'  },
          { number: '0+', label: 'Events'    },
          { number: '0+', label: 'Colleges'  },
          { number: '0+', label: 'Matches'   },
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.25em]">Beta — Actively Building</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
            College Sports.<br />
            <span className="text-[#ccff00]">Finally Organized.</span>
          </h1>

          <p className="text-gray-500 text-base leading-relaxed max-w-xl mb-8">
            Campus League was built by a student who was tired of managing cricket tournaments through
            WhatsApp forwards and handwritten brackets. This is the platform that should have existed already.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-sm">KJ</span>
            </div>
            <div>
              <p className="font-black text-sm text-white">Kshitij Jain</p>
              <p className="text-gray-600 text-xs">2nd Year · Poornima University, Jaipur · Founder</p>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#ccff00]/40 hover:-translate-y-1 transition-all">
              <p className="text-3xl font-black italic text-white mb-1">{stat.number}</p>
              <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* FEATURES */}
        <div className="mb-24">
          <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-2">The Platform</p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-10">What Campus League Does</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#ccff00]/40 hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 bg-[#ccff00]/10 rounded-xl flex items-center justify-center text-[#ccff00] mb-4">{f.icon}</div>
                <p className="font-black text-sm uppercase tracking-wide mb-2">{f.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SPORTS GRID */}
        <div className="mb-24">
          <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Disciplines</p>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Supported Sports<span className="text-[#ccff00]">/</span></h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {sports.map((sport, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="aspect-square flex flex-col items-center justify-center gap-2 bg-[#111] border border-white/5 rounded-2xl hover:bg-[#ccff00] hover:border-[#ccff00] group transition-all cursor-default">
                <span className="text-[#ccff00] group-hover:text-black transition-colors">{sport.icon}</span>
                <span className="text-[9px] font-black uppercase text-gray-500 group-hover:text-black transition-colors tracking-wide text-center leading-tight px-1">{sport.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BEFORE vs AFTER */}
        <div className="mb-24">
          <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-2">The Problem We Solve</p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">Before vs After</h2>
          <p className="text-gray-600 text-sm mb-8">Every college has this problem. Most just live with it.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Without Campus League</span>
            </div>
            <div className="py-2.5 px-4 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-center">
              <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-widest">With Campus League</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {comparisons.map((row, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 group">
                <div className="flex items-center gap-3 bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-3">
                  <X size={13} className="text-red-500 flex-shrink-0" />
                  <span className="text-gray-600 text-xs font-semibold">{row.old}</span>
                </div>
                <div className="flex items-center gap-3 bg-[#0d0d0d] border border-white/5 group-hover:border-[#ccff00]/30 group-hover:bg-[#ccff00]/5 rounded-xl px-4 py-3 transition-all sm:border-l border-l-2 border-l-[#ccff00]/30">
                  <Check size={13} className="text-[#ccff00] flex-shrink-0" />
                  <span className="text-gray-400 group-hover:text-white text-xs font-bold transition-colors">{row.now}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mb-24">
          <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Voices</p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-10">Who It's Built For</h2>

          <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-10 mb-4 relative overflow-hidden">
            <span className="absolute top-4 right-8 text-[8rem] leading-none text-[#ccff00]/5 font-black select-none">"</span>
            <div className="inline-flex px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/15 mb-5">
              <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-widest">{testimonials[activeTestimonial].role}</span>
            </div>
            <p className="text-lg md:text-2xl font-bold italic text-white leading-relaxed mb-8 max-w-3xl relative z-10">
              "{testimonials[activeTestimonial].quote}"
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-black text-sm">{testimonials[activeTestimonial].initials}</span>
                </div>
                <div>
                  <p className="font-black text-sm">{testimonials[activeTestimonial].name}</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest">{testimonials[activeTestimonial].college}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#ccff00] rounded-full">
                <span className="text-black font-black text-[10px] uppercase tracking-widest">{testimonials[activeTestimonial].sport}</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-4">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${activeTestimonial === i ? 'w-6 h-2 bg-[#ccff00]' : 'w-2 h-2 bg-white/15 hover:bg-white/30'}`} />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`p-3 rounded-2xl border text-left transition-all ${activeTestimonial === i ? 'bg-[#ccff00]/10 border-[#ccff00]/30' : 'bg-[#111] border-white/5 hover:border-[#ccff00]/20'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-black text-[10px]">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">{t.name}</p>
                    <p className="text-gray-600 text-[10px]">{t.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-[#ccff00] rounded-[2.5rem] p-10 md:p-16 text-black text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Ready to fix your campus sports?</p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Stop Managing Chaos.<br />Start Running Events.
          </h2>
          <p className="font-medium opacity-60 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Campus League is free to use. Built by a student, for students. Join the beta and help shape what it becomes.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-black uppercase italic text-sm tracking-wide hover:scale-105 transition-transform">
            Join the Beta <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default About;
