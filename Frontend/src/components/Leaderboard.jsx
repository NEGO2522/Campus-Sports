import React, { useState, useEffect } from 'react';
import { FaUsers, FaStar, FaSpinner, FaTrophy, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

const RANK_STYLE = {
  1: { icon: '🥇', glow: 'shadow-[0_0_24px_rgba(250,204,21,0.25)]', border: 'border-yellow-400/30',  bg: 'bg-yellow-400/5'  },
  2: { icon: '🥈', glow: '',                                          border: 'border-gray-400/20',   bg: 'bg-gray-400/5'    },
  3: { icon: '🥉', glow: '',                                          border: 'border-orange-400/20', bg: 'bg-orange-400/5'  },
};

const SPORTS = ['All', 'Cricket', 'Football', 'Basketball', 'Badminton', 'Volleyball', 'Tennis'];

/* ─── Widget mode (inside Dashboard) ─────────────────────────── */
const LeaderboardWidget = ({ players, initialLimit }) => (
  <div className="w-full">
    <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-white/[0.03] border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
      <div className="col-span-1">Rank</div>
      <div className="col-span-7">Player</div>
      <div className="col-span-2 text-center">Events</div>
      <div className="col-span-2 text-right">Points</div>
    </div>
    <div className="divide-y divide-white/5">
      {players.slice(0, initialLimit).map((player, index) => {
        const pos  = index + 1;
        const rank = RANK_STYLE[pos];
        const isTop = pos <= 3;
        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
            className={'group grid grid-cols-12 items-center px-4 sm:px-6 py-4 transition-all hover:bg-white/[0.04] ' + (isTop ? 'bg-gradient-to-r from-[#ccff00]/[0.04] to-transparent' : '')}
          >
            <div className="col-span-2 md:col-span-1">
              {rank ? <span className="text-lg">{rank.icon}</span>
                : <span className="text-base font-black italic text-gray-700">#{String(pos).padStart(2,'0')}</span>}
            </div>
            <div className="col-span-7 flex items-center gap-3">
              <div className={'w-9 h-9 border flex items-center justify-center flex-shrink-0 ' + (isTop ? 'border-[#ccff00]/40 bg-[#ccff00]/10' : 'border-white/10 bg-white/5')}>
                <FaUsers className={isTop ? 'text-[#ccff00]' : 'text-gray-600'} size={13} />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic text-white group-hover:text-[#ccff00] transition-colors">{player.full_name}</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">{player.college_name || '—'}</p>
              </div>
            </div>
            <div className="hidden md:block col-span-2 text-center text-[10px] font-black text-gray-500 uppercase">{player.events_played || 0} EP</div>
            <div className="col-span-3 md:col-span-2 text-right">
              <span className={'text-lg font-black italic ' + (isTop ? 'text-[#ccff00]' : 'text-white')}>{player.points || 0}</span>
              <span className="block text-[8px] font-black uppercase text-gray-600">PTS</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

/* ─── Full page ───────────────────────────────────────────────── */
const LeaderboardPage = ({ players, loading, error, sport, setSport }) => (
  <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-8">
    {/* Background blobs */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#ccff00]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
    </div>

    <div className="relative z-10 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-2 text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
          <FaTrophy size={12} className="animate-pulse" />
          <span>College Rankings</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
          Hall of <span className="text-[#ccff00]">Fame</span>
        </h1>
        <p className="mt-3 text-gray-500 text-sm font-medium">
          Top players at your college ranked by points
        </p>
      </motion.div>

      {/* ── Sport filter ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap mb-8"
      >
        <FaFilter size={10} className="text-gray-600" />
        {SPORTS.map(s => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ' +
              (sport === s
                ? 'bg-[#ccff00] text-black border-[#ccff00]'
                : 'bg-white/5 text-gray-500 border-white/10 hover:border-[#ccff00]/40 hover:text-white')}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* ── Top 3 podium ── */}
      {!loading && !error && players.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[players[1], players[0], players[2]].map((player, i) => {
            const podiumPos = [2, 1, 3][i];
            const heights   = ['h-28', 'h-36', 'h-24'];
            const rank      = RANK_STYLE[podiumPos];
            const isFirst   = podiumPos === 1;
            return (
              <motion.div
                key={player.id}
                whileHover={{ y: -4 }}
                className={'relative flex flex-col items-center justify-end rounded-2xl border p-4 ' + rank.border + ' ' + rank.bg + ' ' + rank.glow + ' ' + heights[i]}
              >
                {isFirst && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400 text-xl animate-bounce">👑</div>
                )}
                <span className="text-2xl mb-1">{rank.icon}</span>
                <p className="text-[10px] font-black uppercase italic text-white text-center truncate w-full">{player.full_name.split(' ')[0]}</p>
                <p className={'text-lg font-black italic ' + (isFirst ? 'text-[#ccff00]' : 'text-white')}>{player.points || 0}</p>
                <span className="text-[7px] font-black uppercase text-gray-600">PTS</span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Full table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-white/[0.03] border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-3 text-center hidden sm:block">Events Played</div>
          <div className="col-span-5 sm:col-span-2 text-right">Points</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-[#ccff00] text-3xl" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <FaTrophy className="mx-auto text-gray-700 text-4xl mb-4" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No rankings yet</p>
            <p className="text-[9px] text-gray-700 uppercase font-bold mt-1">Join events to earn points</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {players.map((player, index) => {
                const pos  = index + 1;
                const rank = RANK_STYLE[pos];
                const isTop = pos <= 3;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={'group grid grid-cols-12 items-center px-6 py-5 transition-all hover:bg-white/[0.04] ' +
                      (isTop ? 'bg-gradient-to-r from-[#ccff00]/[0.04] to-transparent' : '')}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {rank
                        ? <span className="text-xl">{rank.icon}</span>
                        : <span className="text-lg font-black italic text-gray-700">#{String(pos).padStart(2,'0')}</span>}
                    </div>

                    {/* Player info */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className={'relative w-11 h-11 border flex items-center justify-center flex-shrink-0 transition-all group-hover:border-[#ccff00] ' +
                        (isTop ? 'border-[#ccff00]/40 bg-[#ccff00]/10' : 'border-white/10 bg-white/5')}
                      >
                        <span className={'text-sm font-black ' + (isTop ? 'text-[#ccff00]' : 'text-gray-500')}>
                          {player.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                        {pos === 1 && <FaStar size={9} className="absolute -top-1.5 -right-1.5 text-yellow-400 animate-pulse" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase italic text-white group-hover:text-[#ccff00] transition-colors truncate">
                          {player.full_name}
                        </p>
                        <p className="text-[9px] font-bold text-gray-600 uppercase truncate">
                          {player.college_name || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Events played */}
                    <div className="col-span-3 text-center hidden sm:block">
                      <span className="text-xs font-black text-gray-500 uppercase">{player.events_played || 0}</span>
                      <span className="block text-[8px] font-black text-gray-700 uppercase">events</span>
                    </div>

                    {/* Points */}
                    <div className="col-span-5 sm:col-span-2 text-right">
                      <span className={'text-2xl font-black italic leading-none ' + (isTop ? 'text-[#ccff00]' : 'text-white')}>
                        {player.points || 0}
                      </span>
                      <span className="block text-[8px] font-black uppercase text-gray-600 tracking-[0.2em]">PTS</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Footer note */}
      {!loading && !error && players.length > 0 && (
        <p className="text-center text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-6">
          {players.length} players ranked · Points update after each match
        </p>
      )}
    </div>
  </div>
);

/* ─── Main export — auto-detects widget vs page ───────────────── */
const Leaderboard = ({ initialLimit = 5 }) => {
  const location = useLocation();
  const isPage   = location.pathname === '/leaderboard';

  const [players, setPlayers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [sport,   setSport]     = useState('All');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = sport === 'All'
          ? '/leaderboard?scope=college'
          : '/leaderboard?scope=college&sport=' + encodeURIComponent(sport);
        const data = await api.get(query);
        setPlayers(data);
      } catch (err) {
        console.error(err);
        setError('Could not load rankings.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [sport]);

  if (isPage) {
    return <LeaderboardPage players={players} loading={loading} error={error} sport={sport} setSport={setSport} />;
  }

  // Widget mode (Dashboard embed)
  if (loading) return <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-[#ccff00] text-2xl" /></div>;
  if (error)   return <div className="text-center py-10"><p className="text-[10px] font-bold text-red-500 uppercase">{error}</p></div>;
  if (players.length === 0) return (
    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No rankings yet</p>
    </div>
  );

  return <LeaderboardWidget players={players} initialLimit={initialLimit} />;
};

export default Leaderboard;
