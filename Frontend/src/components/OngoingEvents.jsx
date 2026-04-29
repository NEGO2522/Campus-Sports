import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Flame, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SPORT_META = {
  Cricket:        { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', emoji: '🏏' },
  Football:       { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    emoji: '⚽' },
  Basketball:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  emoji: '🏀' },
  Badminton:      { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  emoji: '🏸' },
  Volleyball:     { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  emoji: '🏐' },
  Tennis:         { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     emoji: '🎾' },
  'Table Tennis': { color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    emoji: '🏓' },
};

const DEFAULT_META = { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', emoji: '🏆' };

const OngoingEvents = ({ onEventClick }) => {
  const navigate = useNavigate();

  const handleEventClick = (event) => {
    if (onEventClick) onEventClick(event);
    else navigate('/events/' + event.id);
  };
  const [events, setEvents] = useState([]);
  const [matchesByEvent, setMatchesByEvent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingEventsAndMatches = async () => {
      setLoading(true);
      try {
        const eventsArr = await api.get('/events?status=ongoing');
        setEvents(eventsArr);

        const matchesObj = {};
        for (const event of eventsArr) {
          try {
            const matches = await api.get('/events/' + event.id + '/matches');
            matchesObj[event.id] = matches;
          } catch {
            matchesObj[event.id] = [];
          }
        }
        setMatchesByEvent(matchesObj);
      } catch (err) {
        console.error('Failed to fetch ongoing events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOngoingEventsAndMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[#ccff00]/20 rounded-full" />
          <div className="w-10 h-10 border-2 border-t-[#ccff00] rounded-full animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center p-14 bg-[#111] border border-dashed border-white/10 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/3 to-transparent pointer-events-none" />
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Radio size={26} className="text-gray-700" />
        </div>
        <p className="text-gray-600 uppercase tracking-widest text-xs font-black mb-1">
          No Live Action Right Now
        </p>
        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">
          Ongoing events will appear here
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-700" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {events.map((event, index) => {
        const matches = matchesByEvent[event.id] || [];
        const matchesToShow = matches.slice(0, 2);
        const meta = SPORT_META[event.sport] || DEFAULT_META;
        const eventName = event.event_name || event.eventName || event.title;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 22 }}
            className="group relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#ccff00]/30 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            onClick={() => handleEventClick(event)}
          >
            {/* Live pulse bar */}
            <div className="h-[3px] bg-gradient-to-r from-red-500 via-red-400 to-red-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ' + meta.color + ' ' + meta.bg + ' ' + meta.border}>
                      {meta.emoji} {event.sport || 'Sport'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#ccff00] transition-colors leading-tight truncate">
                    {eventName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-gray-600 uppercase">
                    <FaMapMarkerAlt size={8} className="text-[#ccff00]/50" />
                    {event.location}
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#ccff00]/10 transition-all flex-shrink-0 ml-3">
                  <Flame size={16} className="text-gray-600 group-hover:text-[#ccff00] transition-colors" />
                </div>
              </div>

              {/* Matches */}
              <div className="space-y-2.5">
                {matchesToShow.length > 0 ? (
                  matchesToShow.map((match, mi) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.08 }}
                      className="bg-black/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] font-black bg-[#ccff00] text-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                          {match.round || match.matchName}
                        </span>
                        {match.status === 'live' ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-black text-red-400 uppercase italic">Live</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold uppercase">
                            {match.match_date ? format(new Date(match.match_date), 'HH:mm') : 'Soon'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {[
                          { team: match.team1_name || 'Team 1', score: match.team1_score },
                          { team: match.team2_name || 'Team 2', score: match.team2_score },
                        ].map((t, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[9px] font-black text-gray-500">
                                {t.team.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold uppercase tracking-tight text-gray-300 truncate max-w-[120px]">
                                {t.team}
                              </span>
                            </div>
                            <span className={'text-xl font-black italic tabular-nums ' + (t.score != null ? 'text-white' : 'text-gray-800')}>
                              {t.score != null ? t.score : '—'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {match.location && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-gray-600 uppercase font-bold">
                          <FaMapMarkerAlt size={8} className="text-[#ccff00]/40" />
                          {match.location}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                    <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
                      Awaiting Matchup
                    </span>
                  </div>
                )}
              </div>

              {matches.length > 2 && (
                <button className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 bg-white/3 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all">
                  +{matches.length - 2} More Matches <FaChevronRight size={8} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OngoingEvents;
