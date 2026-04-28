import React, { useState, useEffect } from 'react';
import { FaUsers, FaStar, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = ({ initialLimit = 5 }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: const data = await api.get('/leaderboard?scope=college');
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <FaSpinner className="animate-spin text-[#ccff00] text-3xl" />
    </div>
  );

  if (teams.length === 0) return (
    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        No rankings yet — matches ke baad points aayenge
      </p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="divide-y divide-white/5">
        <AnimatePresence>
          {teams.slice(0, initialLimit).map((team, index) => (
            <motion.div key={team.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.04]">
              <div className="col-span-1">
                <span className="text-xl font-black italic text-gray-700">#{index + 1}</span>
              </div>
              <div className="col-span-8 flex items-center gap-4">
                <FaUsers className="text-gray-600" />
                <span className="font-black uppercase text-white">{team.full_name}</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-xl font-black text-[#ccff00]">{team.points || 0}</span>
                <span className="block text-[8px] text-gray-600 uppercase">PTS</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Leaderboard;