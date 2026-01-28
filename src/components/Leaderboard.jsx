import React, { useState, useEffect } from 'react';
import { FaUsers, FaStar } from 'react-icons/fa';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = ({ initialLimit = 5 }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'teams'), orderBy('points', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        position: index + 1
      }));
      setTeams(teamsData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('System Error: Could not sync standings.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const displayData = teams.slice(0, initialLimit);

  if (loading) return (
    <div className="flex justify-center py-20 bg-black min-h-[300px]">
      <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full bg-black py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-end justify-between gap-4 px-2">
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
              Hall <span className="text-[#ccff00] [text-shadow:0_0_15px_rgba(204,255,0,0.3)]">Of Fame</span>
            </h2>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">
              Live Rankings • Top {initialLimit} Squads
            </p>
          </div>
        </div>

        {/* Main Board Container */}
        <div className="bg-[#050505] border border-white/10 overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 px-8 py-5 bg-white/[0.03] border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <div className="col-span-1">Rank</div>
            <div className="col-span-6">Squad Name</div>
            <div className="col-span-2 text-center">Played</div>
            <div className="col-span-3 text-right">Points</div>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {displayData.map((team, index) => {
                const isTopThree = team.position <= 3;
                
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`group grid grid-cols-12 items-center px-4 sm:px-8 py-5 transition-all hover:bg-white/[0.04] ${
                      isTopThree ? 'bg-gradient-to-r from-[#ccff00]/[0.05] to-transparent' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1">
                      <span className={`text-xl font-black italic tracking-tighter 
                        ${team.position === 1 ? 'text-yellow-400 [text-shadow:0_0_10px_rgba(250,204,21,0.5)]' : 
                          team.position === 2 ? 'text-gray-300' : 
                          team.position === 3 ? 'text-orange-500' : 'text-gray-700'}`}>
                        #{team.position.toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Team Info */}
                    <div className="col-span-7 md:col-span-6 flex items-center gap-4">
                      <div className={`relative flex-shrink-0 w-10 h-10 border transition-all duration-300 group-hover:border-[#ccff00] flex items-center justify-center
                        ${isTopThree ? 'border-[#ccff00]/40 bg-[#ccff00]/10' : 'border-white/10 bg-white/5'}`}>
                        <FaUsers className={`${isTopThree ? 'text-[#ccff00]' : 'text-gray-600'}`} size={14} />
                        {team.position === 1 && (
                          <div className="absolute -top-1.5 -right-1.5 text-yellow-400">
                            <FaStar size={10} className="animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-black uppercase italic text-white group-hover:text-[#ccff00] transition-colors tracking-tight">
                          {team.name}
                        </h4>
                        <p className="text-[8px] font-bold text-gray-500 uppercase">
                          {team.members || 0} Registered
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:block col-span-2 text-center text-xs font-black text-gray-500 uppercase tracking-widest">
                      {team.matchesPlayed || 0} MP
                    </div>

                    {/* Points */}
                    <div className="col-span-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-xl font-black italic tracking-tighter leading-none ${
                          isTopThree ? 'text-[#ccff00]' : 'text-white'
                        }`}>
                          {team.points || 0}
                        </span>
                        <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.2em]">PTS</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Simple Footer Hint */}
        {teams.length > initialLimit && (
          <div className="px-2">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700">
              Showing top {initialLimit} of {teams.length} total squads
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;