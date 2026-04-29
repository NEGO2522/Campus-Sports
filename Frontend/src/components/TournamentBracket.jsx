import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaCrown, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { ArrowLeft, Zap, Clock, Edit3, Shield } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import { getUser } from '../utils/auth';

const STATUS_STYLE = {
  scheduled: { bg: 'bg-white/5',          border: 'border-white/10',         text: 'text-gray-500',  label: 'Scheduled' },
  live:       { bg: 'bg-red-500/10',       border: 'border-red-500/25',       text: 'text-red-400',   label: '🔴 Live'    },
  completed:  { bg: 'bg-[#ccff00]/10',     border: 'border-[#ccff00]/25',     text: 'text-[#ccff00]', label: 'Done'       },
};

// ── Single match card ────────────────────────────────────────────────────────
const MatchCard = ({ match, isCreator, onEdit, onSelect }) => {
  const ss = STATUS_STYLE[match.status] || STATUS_STYLE.scheduled;
  const t1Wins = match.status === 'completed' && match.team1_score != null && match.team1_score > match.team2_score;
  const t2Wins = match.status === 'completed' && match.team2_score != null && match.team2_score > match.team1_score;

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(match)}
      className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#ccff00]/30 transition-all group"
    >
      {/* top colour bar */}
      <div className={`h-[3px] ${match.status === 'live' ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-500/30' : 'bg-gradient-to-r from-[#ccff00]/40 to-transparent'}`} />

      <div className="p-4">
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-black bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] uppercase tracking-widest px-2 py-0.5 rounded-md truncate max-w-[140px]">
            {match.round || 'Match'}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${ss.bg} ${ss.border} ${ss.text}`}>
              {ss.label}
            </span>
            {isCreator && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(match); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#ccff00] hover:text-black text-gray-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit3 size={11} />
              </button>
            )}
          </div>
        </div>

        {/* teams */}
        <div className="space-y-2">
          {[
            { name: match.team1_name || 'TBD', score: match.team1_score, wins: t1Wins },
            { name: match.team2_name || 'TBD', score: match.team2_score, wins: t2Wins },
          ].map((t, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl px-3 py-2 border transition-all ${
                t.wins
                  ? 'bg-[#ccff00]/8 border-[#ccff00]/20'
                  : 'bg-white/3 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-black text-gray-500 flex-shrink-0">
                  {(t.name || '?').charAt(0).toUpperCase()}
                </div>
                <span className={`text-xs font-bold uppercase tracking-tight truncate ${t.wins ? 'text-[#ccff00]' : 'text-gray-300'}`}>
                  {t.name}
                </span>
                {t.wins && <FaCrown size={8} className="text-[#ccff00] flex-shrink-0" />}
              </div>
              <span className={`text-xl font-black italic tabular-nums ml-3 ${t.score != null ? (t.wins ? 'text-[#ccff00]' : 'text-white') : 'text-gray-700'}`}>
                {t.score != null ? t.score : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
          {match.location ? (
            <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold uppercase">
              <FaMapMarkerAlt size={8} className="text-[#ccff00]/40" />
              {match.location}
            </div>
          ) : <div />}
          {match.match_date && (
            <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold">
              <Clock size={8} />
              {format(new Date(match.match_date), 'MMM d • HH:mm')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TournamentBracket = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [event, setEvent]     = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selected, setSelected] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventData, matchData] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/matches`),
      ]);
      setEvent(eventData);
      setMatches(matchData);
      if (eventData.created_by && currentUser?.id && eventData.created_by === currentUser.id) {
        setIsCreator(true);
      }
    } catch (err) {
      setError(err?.error || 'Failed to load bracket data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [eventId]);

  // Group matches by round label
  const rounds = React.useMemo(() => {
    const map = {};
    matches.forEach(m => {
      const key = m.round || 'Matches';
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [matches]);

  const roundKeys = Object.keys(rounds);

  // Derive champion: completed final match winner
  const champion = React.useMemo(() => {
    if (!matches.length) return null;
    const finalMatch = [...matches]
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.match_date || 0) - new Date(a.match_date || 0))[0];
    if (!finalMatch) return null;
    if (finalMatch.team1_score > finalMatch.team2_score) return finalMatch.team1_name;
    if (finalMatch.team2_score > finalMatch.team1_score) return finalMatch.team2_name;
    return null;
  }, [matches]);

  const stats = React.useMemo(() => {
    const total     = matches.length;
    const completed = matches.filter(m => m.status === 'completed').length;
    const live      = matches.filter(m => m.status === 'live').length;
    const teams     = new Set([...matches.map(m => m.team1_name), ...matches.map(m => m.team2_name)].filter(Boolean)).size;
    return { total, completed, live, teams };
  }, [matches]);

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
        <div className="w-12 h-12 border-2 border-t-[#ccff00] rounded-full animate-spin absolute inset-0" />
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 text-white px-4">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-3xl">⚠️</div>
      <p className="text-red-400 font-bold uppercase tracking-widest text-sm">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-[#ccff00] text-black font-black italic uppercase px-6 py-3 rounded-xl text-xs">
        Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 sm:px-6">
      {/* ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] blur-[150px] rounded-full pointer-events-none opacity-10 bg-[#ccff00]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── HEADER ── */}
        <div className="mb-10">
          <button onClick={() => navigate(`/events/${eventId}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest mb-5 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Event
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#ccff00] font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
                <Zap size={12} className="animate-pulse" />
                Tournament Bracket
              </div>
              <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {event?.event_name || 'Tournament'}
              </h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
                {event?.sport} • {event?.college_name}
              </p>
            </div>

            {isCreator && (
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] text-gray-400 font-black uppercase text-[10px] tracking-widest px-4 py-2.5 rounded-xl transition-all"
              >
                <Shield size={12} /> Manage Event
              </button>
            )}
          </div>
        </div>

        {/* ── CHAMPION BANNER (only when available) ── */}
        <AnimatePresence>
          {champion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-gradient-to-r from-[#ccff00]/20 via-[#ccff00]/10 to-transparent border border-[#ccff00]/30 rounded-3xl p-6 flex items-center gap-5"
            >
              <div className="text-5xl">🏆</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ccff00]/60 mb-1">Champion</p>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#ccff00]">{champion}</h2>
              </div>
              <div className="ml-auto flex gap-1">
                <FaMedal className="text-[#ccff00]/40 text-xl" />
                <FaCrown className="text-[#ccff00] text-xl" />
                <FaMedal className="text-[#ccff00]/40 text-xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Teams',     value: stats.teams,     accent: true  },
            { label: 'Matches',   value: stats.total,     accent: false },
            { label: 'Completed', value: stats.completed, accent: false },
            { label: 'Live Now',  value: stats.live,      accent: stats.live > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 border ${s.accent ? 'bg-[#ccff00]/10 border-[#ccff00]/20' : 'bg-[#111] border-white/10'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${s.accent ? 'text-[#ccff00]/60' : 'text-gray-600'}`}>{s.label}</p>
              <p className={`text-3xl font-black italic ${s.accent ? 'text-[#ccff00]' : 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── NO MATCHES STATE ── */}
        {matches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaTrophy className="text-gray-700 text-2xl" />
            </div>
            <p className="text-gray-600 font-black uppercase tracking-widest text-xs mb-1">No Matches Yet</p>
            <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">
              {isCreator ? 'Add matches from the Event page' : 'Matches will appear here when the creator adds them'}
            </p>
            {isCreator && (
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="mt-6 bg-[#ccff00] text-black font-black italic uppercase px-6 py-3 rounded-xl text-xs hover:bg-[#d9ff33] transition-all"
              >
                Go to Event Page
              </button>
            )}
          </div>
        ) : (
          /* ── ROUNDS ── */
          <div className="space-y-10">
            {roundKeys.map((roundName, ri) => (
              <motion.section
                key={roundName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ri * 0.08 }}
              >
                {/* Round header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl flex items-center justify-center text-[#ccff00] font-black text-sm">
                      {ri + 1}
                    </div>
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">{roundName}</h2>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    {rounds[roundName].length} match{rounds[roundName].length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Match cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rounds[roundName].map((match, mi) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isCreator={isCreator}
                      onEdit={m => navigate(`/events/${eventId}/matches/${m.id}/edit`)}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* ── MATCH DETAIL MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] font-black bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] uppercase tracking-widest px-2 py-1 rounded-md">
                  {selected.round || 'Match'}
                </span>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { name: selected.team1_name || 'TBD', score: selected.team1_score, wins: selected.status === 'completed' && selected.team1_score > selected.team2_score },
                  { name: selected.team2_name || 'TBD', score: selected.team2_score, wins: selected.status === 'completed' && selected.team2_score > selected.team1_score },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-2xl px-5 py-4 border ${t.wins ? 'bg-[#ccff00]/8 border-[#ccff00]/25' : 'bg-white/3 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center font-black text-sm text-gray-400">
                        {(t.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase italic ${t.wins ? 'text-[#ccff00]' : 'text-white'}`}>{t.name}</p>
                        {t.wins && <p className="text-[9px] text-[#ccff00]/60 font-bold uppercase tracking-widest">Winner 🏆</p>}
                      </div>
                    </div>
                    <span className={`text-4xl font-black italic tabular-nums ${t.score != null ? (t.wins ? 'text-[#ccff00]' : 'text-white') : 'text-gray-700'}`}>
                      {t.score != null ? t.score : '—'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {selected.location && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt size={10} className="text-[#ccff00]/50" />
                    {selected.location}
                  </div>
                )}
                {selected.match_date && (
                  <div className="flex items-center gap-2">
                    <Clock size={10} className="text-[#ccff00]/50" />
                    {format(new Date(selected.match_date), 'MMM dd, yyyy • hh:mm a')}
                  </div>
                )}
              </div>

              {isCreator && (
                <button
                  onClick={() => { setSelected(null); navigate(`/events/${eventId}/matches/${selected.id}/edit`); }}
                  className="w-full mt-6 py-3 bg-[#ccff00] text-black font-black italic uppercase text-xs tracking-widest rounded-xl hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} /> Edit Match
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentBracket;
