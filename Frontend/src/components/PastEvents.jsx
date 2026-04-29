import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { CheckCircle, Users, Calendar, Medal } from 'lucide-react';
import api from '../utils/api';

const SPORT_META = {
  Cricket:        { color: 'text-emerald-400', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/20', emoji: '🏏', gradient: 'from-emerald-500/10 to-transparent' },
  Football:       { color: 'text-blue-400',    bg: 'bg-blue-500/8',     border: 'border-blue-500/20',    emoji: '⚽', gradient: 'from-blue-500/10 to-transparent' },
  Basketball:     { color: 'text-orange-400',  bg: 'bg-orange-500/8',   border: 'border-orange-500/20',  emoji: '🏀', gradient: 'from-orange-500/10 to-transparent' },
  Badminton:      { color: 'text-yellow-400',  bg: 'bg-yellow-500/8',   border: 'border-yellow-500/20',  emoji: '🏸', gradient: 'from-yellow-500/10 to-transparent' },
  Volleyball:     { color: 'text-purple-400',  bg: 'bg-purple-500/8',   border: 'border-purple-500/20',  emoji: '🏐', gradient: 'from-purple-500/10 to-transparent' },
  Tennis:         { color: 'text-red-400',     bg: 'bg-red-500/8',      border: 'border-red-500/20',     emoji: '🎾', gradient: 'from-red-500/10 to-transparent' },
  'Table Tennis': { color: 'text-pink-400',    bg: 'bg-pink-500/8',     border: 'border-pink-500/20',    emoji: '🏓', gradient: 'from-pink-500/10 to-transparent' },
};

const DEFAULT_META = { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', emoji: '🏆', gradient: 'from-white/5 to-transparent' };

const PastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get('/events?status=completed');
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <FaSpinner className="animate-spin text-gray-700 text-xl" />
    </div>
  );

  if (events.length === 0) return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-14 border border-dashed border-white/8 rounded-3xl"
    >
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Medal size={20} className="text-gray-700" />
      </div>
      <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No past events yet</p>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event, index) => {
        const meta = SPORT_META[event.sport] || DEFAULT_META;
        const participantCount = event.participant_count || 0;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 180, damping: 20 }}
            className="group relative bg-[#111] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${meta.gradient} blur-2xl pointer-events-none opacity-60`} />
            <div className="h-[2px] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${meta.color} ${meta.bg} ${meta.border}`}>
                  <FaTrophy size={8} />
                  {meta.emoji} {event.sport}
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">
                  <CheckCircle size={10} className="text-gray-600" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-600">Completed</span>
                </div>
              </div>

              <h3 className="text-[15px] font-black italic uppercase tracking-tight text-white/80 leading-tight mb-2 group-hover:text-white transition-colors">
                {event.event_name}
              </h3>

              {event.description && (
                <p className="text-[10px] text-gray-600 leading-relaxed mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="h-px bg-white/5 mb-3" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Calendar size={9} className="text-gray-600" />
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wide">
                    {event.date_time ? format(new Date(event.date_time), 'MMM dd, yyyy') : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt size={8} className="text-gray-600" />
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wide truncate">
                    {event.location}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="w-5 h-5 rounded-md bg-[#ccff00]/10 flex items-center justify-center flex-shrink-0">
                    <Users size={9} className="text-[#ccff00]" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-white">{participantCount}</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">participated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PastEvents;
