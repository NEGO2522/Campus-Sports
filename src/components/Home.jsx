import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Zap, Calendar, ArrowRight, 
  Target, Activity, ChevronRight, Play 
} from 'lucide-react';
import Navbar from './Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  
  const words = ["VICTORY", "COMMUNITY", "GLORY", "LEAGUES"];
  
  const sportsImages = [
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000&auto=format&fit=crop",
  ];

  // Global function to handle auth redirection
  const handleAuthRedirect = () => navigate('/login');

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(wordInterval);
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
    }
  };

  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black font-sans overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
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

            <motion.h1 variants={itemVars} className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-[0.9] text-left">
              YOUR PATH TO <br />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: 90 }}
                  transition={{ duration: 0.5 }}
                  className="text-[#ccff00] inline-block"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </motion.h1>

            <motion.p variants={itemVars} className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed text-left max-w-xl">
              The elite OS for campus sports. Organize tournaments, track stats, and 
              build your legacy in one powerhouse platform.
            </motion.p>

            <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={handleAuthRedirect}
                className="group relative bg-[#ccff00] text-black px-10 py-5 rounded-full font-black text-lg overflow-hidden transition-transform hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  JOIN THE LEAGUE <ArrowRight size={20} />
                </span>
              </button>
              <button 
                onClick={handleAuthRedirect}
                className="flex items-center gap-3 font-bold text-white hover:text-[#ccff00] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#ccff00]">
                  <Play size={18} fill="currentColor" />
                </div>
                WATCH SHOWREEL
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Static Image Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-[400px] md:h-[550px] w-full"
          >
            <div className="absolute inset-0 bg-[#111] rounded-[3rem] border border-white/10 rotate-3 scale-95 overflow-hidden">
               <div className="absolute inset-0 bg-[#ccff00]/5 z-10 pointer-events-none" />
            </div>

            <div className="absolute inset-0 rounded-[3rem] overflow-hidden -rotate-2 border-2 border-[#ccff00]/30 shadow-[0_0_50px_rgba(204,255,0,0.1)]">
              <img
                src={sportsImages[0]}
                className="w-full h-full object-cover grayscale-[20%]"
                alt="Basketball"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 bg-[#ccff00] text-black p-4 rounded-2xl flex items-center gap-3">
                <Trophy size={24} strokeWidth={3} />
                <span className="font-black italic text-sm uppercase">Active Season 2024</span>
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-[#ccff00] rounded-full flex items-center justify-center text-black -rotate-12 shadow-xl shadow-[#ccff00]/20"
            >
              <Zap size={40} fill="currentColor" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE BENTO GRID --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={handleAuthRedirect}
            className="md:col-span-8 bg-[#111] border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group min-h-[400px]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={200} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-14 h-14 bg-[#ccff00] rounded-2xl flex items-center justify-center text-black mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-4xl font-black mb-4 italic leading-tight uppercase">Championship <br /> Management</h3>
              <p className="text-gray-400 max-w-md">Real-time brackets, automated scoring, and referee coordination for every major campus sport.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            onClick={handleAuthRedirect}
            className="md:col-span-4 bg-[#ccff00] rounded-[2rem] p-10 text-black flex flex-col justify-between min-h-[400px]"
          >
            <Users size={40} strokeWidth={3} />
            <div>
              <h3 className="text-3xl font-black italic mb-2 uppercase">Pro Rosters</h3>
              <p className="font-medium opacity-80 text-sm">Build your team, trade players, and manage substitutions with ease.</p>
            </div>
          </motion.div>

          <div 
            onClick={handleAuthRedirect}
            className="md:col-span-4 bg-[#111] border border-white/10 rounded-[2rem] p-8 hover:bg-[#161616] transition-colors min-h-[250px] flex flex-col justify-center group"
          >
            <Activity className="text-[#ccff00] mb-6" size={32} />
            <h4 className="text-xl font-bold mb-2 italic uppercase">Live Analytics</h4>
            <p className="text-gray-500 text-sm">Deep dive into player stats, heatmaps, and performance trends after every match.</p>
          </div>

          <div 
            onClick={handleAuthRedirect}
            className="md:col-span-4 bg-blue-600 rounded-[2rem] p-8 flex flex-col justify-between group min-h-[250px]"
          >
            <Calendar size={32} className="text-white" />
            <div className="flex justify-between items-end">
              <h4 className="text-xl font-bold italic leading-tight uppercase">Smart <br /> Scheduling</h4>
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-[#ccff00] rounded-[3rem] p-12 md:p-20 text-center text-black relative overflow-hidden shadow-[0_20px_50px_rgba(204,255,0,0.15)]">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 opacity-10"
          >
            <Zap size={300} fill="currentColor" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black italic mb-8 relative z-10 uppercase tracking-tighter">Ready to Dominate?</h2>
          <button 
            onClick={handleAuthRedirect}
            className="bg-black text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl relative z-10 uppercase italic"
          >
            Create an Event Now
          </button>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-white/5">
        <p className="text-gray-600 text-xs font-bold tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} CAMPUS LEAGUE — BORN TO WIN.
        </p>
      </footer>
    </div>
  );
};

export default Home;