import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, Trophy } from 'lucide-react';
import api from '../utils/api';

const SPORT_META = {
  Cricket:        { color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25', glow: '#10b981', emoji: '🏏' },
  Football:       { color: 'text-blue-400',     bg: 'bg-blue-500/10',     border: 'border-blue-500/25',    glow: '#3b82f6', emoji: '⚽' },
  Basketball:     { color: 'text-orange-400',   bg: 'bg-orange-500/10',   border: 'border-orange-500/25',  glow: '#f97316', emoji: '🏀' },
  Badminton:      { color: 'text-yellow-400',   bg: 'bg-yellow-500/10',   border: 'border-yellow-500/25',  glow: '#eab308', emoji: '🏸' },
  Volleyball:     { color: 'text-purple-400',   bg: 'bg-purple-500/10',   border: 'border-purple-500/25',  glow: '#a855f7', emoji: '🏐' },
  Tennis:         { color: 'text-red-400',      bg: 'bg-red-500/10',      border: 'border-red-500/25',     glow: '#ef4444', emoji: '🎾' },
  'Table Tennis': { color: 'text-pink-400',     bg: 'bg-pink-500/10',     border: 'border-pink-500/25',    glow: '#ec4899', emoji: '🏓' },
};

const DEFAULT_META = { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', glow: '#ccff00', emoji: '🏆' };

const UpcomingEvents = ({ eventType = null, showEmpty = true }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const queryParams = new URLSearchParams({ status: 'upcoming' });
        if (eventType) {
          queryParams.append('eventType', eventType);
        }
        const data = await api.get(`/events?${queryParams.toString()}`);
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [eventType]);

  if (loading) return (
    <div className="flex justify-center p-12">
      <FaSpinner className="animate-spin text-[#ccff00] text-2xl" />
    </div>
  );

  if (events.length === 0) {
    if (!showEmpty) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-14 bg-[#111] border border-dashed border-white/10 rounded-3xl"
      >
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-gray-700" />
        </div>
        <p className="text-gray-600 uppercase tracking-widest text-xs font-black mb-4">
          No upcoming events yet
        </p>
        <button
          onClick={() => navigate('/create-event')}
          className="inline-flex items-center gap-2 bg-[#ccff00] text-black text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#d9ff33] transition-all active:scale-[0.97]"
        >
          <Zap size={12} /> Create the first event
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event, index) => {
        const meta = SPORT_META[event.sport] || DEFAULT_META;
        const spotsLeft = event.players_needed - (event.participant_count || 0);
        const fillPct = Math.min(((event.participant_count || 0) / (event.players_needed || 1)) * 100, 100);
        const isHovered = hoveredId === event.id;
        const isFull = spotsLeft <= 0;
        const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate(`/events/${event.id}`)}
            className="group relative bg-[#111] border border-white/8 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              boxShadow: isHovered ? `0 0 40px ${meta.glow}18` : 'none',
            }}
          >
            {/* Top accent bar */}
            <div
              className={`h-[3px] w-full transition-all duration-500 ${meta.bg.replace('/10', '/40')}`}
              style={{ background: isHovered ? meta.glow : 'transparent', opacity: isHovered ? 0.7 : 0 }}
            />
            <div className={`absolute top-0 left-0 h-[3px] transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}
              style={{ background: `linear-gradient(90deg, ${meta.glow}, ${meta.glow}80)` }}
            />

            <div className="p-5">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${meta.color} ${meta.bg} ${meta.border}`}>
                  <span>{meta.emoji}</span>
                  {event.sport}
                </div>

                <div className="flex items-center gap-2">
                  {/* Event Type Badge */}
                  {event.event_type === 'community' && (
                    <span className="text-[9px] font-black uppercase bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-lg">
                      Pickup Game
                    </span>
                  )}
                  {event.event_type === 'official' && (
                    <span className="text-[9px] font-black uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                      Official
                    </span>
                  )}

                  {isFull ? (
                    <span className="text-[9px] font-black text-gray-500 uppercase bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                      FULL
                    </span>
                  ) : isAlmostFull ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-400 uppercase bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg animate-pulse">
                      🔥 {spotsLeft} left
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Event Name */}
              <h3 className={`text-[15px] font-black italic uppercase tracking-tight leading-tight mb-4 transition-colors duration-200 ${isHovered ? meta.color : 'text-white'}`}>
                {event.event_name}
              </h3>

              {/* Info Pills */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt size={9} className="text-[#ccff00]" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">
                    {event.date_time ? format(new Date(event.date_time), 'MMM dd, yyyy • hh:mm a') : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt size={9} className="text-[#ccff00]" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">
                    {event.location}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FaUsers size={9} className="text-[#ccff00]" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    {event.participant_count || 0} / {event.players_needed} joined
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {event.players_needed > 0 && (
                <div className="mb-4">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${fillPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.06 + 0.3, ease: 'easeOut' }}
                      style={{
                        background: fillPct >= 90
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : fillPct >= 60
                          ? 'linear-gradient(90deg, #f97316, #ea580c)'
                          : 'linear-gradient(90deg, #ccff00, #a3cc00)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-gray-700 font-bold uppercase">{Math.round(fillPct)}% filled</span>
                    <span className="text-[8px] text-gray-700 font-bold uppercase">{isFull ? '🔒 closed' : `${spotsLeft} open`}</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider truncate pr-2">
                  {event.college_name}
                </span>
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wide transition-colors duration-200 ${isHovered ? meta.color : 'text-gray-600'}`}>
                  View <ChevronRight size={11} className={`transition-transform duration-200 ${isHovered ? 'translate-x-0.5' : ''}`} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UpcomingEvents;
