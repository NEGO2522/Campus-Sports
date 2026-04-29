import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRunning, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { ChevronRight, Loader2 } from 'lucide-react';
import api from '../utils/api';

const STATUS_STYLE = {
  upcoming:  { label: 'Upcoming',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ongoing:   { label: 'Live',      cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Completed', cls: 'bg-white/5 text-gray-500 border-white/10' },
};

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get('/users/me/events');
        setEvents(data);
      } catch (err) {
        setError('Events load nahi hue.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
            <FaRunning size={12} />
            <span>My Journey</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
            My <span className="text-[#ccff00]">Events</span>
          </h1>
          <p className="mt-3 text-gray-500 text-sm font-medium">
            Jin events mein tune participate kiya
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#ccff00]" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-3xl p-20 text-center">
            <FaRunning className="mx-auto text-gray-700 text-5xl mb-5" />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Abhi koi event join nahi kiya</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#ccff00] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#d9ff33] transition-all">
              Events Dhundho <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event, i) => {
              const st = STATUS_STYLE[event.status] || STATUS_STYLE.upcoming;
              const date = new Date(event.date_time).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/events/${event.id}`}
                    className="group flex items-center justify-between bg-[#111] border border-white/10 hover:border-[#ccff00]/40 transition-all rounded-2xl px-6 py-5"
                  >
                    <div className="flex items-center gap-5">
                      {/* Sport icon box */}
                      <div className="w-12 h-12 bg-[#ccff00]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaRunning size={18} className="text-[#ccff00]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#ccff00] transition-colors">
                            {event.event_name}
                          </h3>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <FaRunning size={9} /> {event.sport}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt size={9} /> {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={9} /> {date}
                          </span>
                          {event.team_name && (
                            <span className="text-[#ccff00]/60">Team: {event.team_name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-600 group-hover:text-[#ccff00] transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Count */}
        {!loading && !error && events.length > 0 && (
          <p className="text-center text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-8">
            {events.length} events joined
          </p>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
