import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Zap, Trash2, Eye, Play, CheckCircle,
  RotateCcw, Trophy, Clock, ChevronRight, Pencil
} from 'lucide-react';
import api from '../../utils/api';

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  dot: 'bg-[#ccff00]',   badge: 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20' },
  ongoing:   { label: 'Live 🔴',   dot: 'bg-green-500',   badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  completed: { label: 'Completed', dot: 'bg-gray-600',    badge: 'bg-gray-500/10 text-gray-500 border-gray-500/20'  },
};

// Next valid status transitions
const NEXT_STATUS = {
  upcoming:  { value: 'ongoing',   label: 'Go Live',   icon: Play,         cls: 'bg-green-500 hover:bg-green-400 text-black' },
  ongoing:   { value: 'completed', label: 'End Event', icon: CheckCircle,  cls: 'bg-blue-500 hover:bg-blue-400 text-white'   },
  completed: { value: 'upcoming',  label: 'Reopen',    icon: RotateCcw,    cls: 'bg-white/10 hover:bg-white/20 text-white'   },
};

const ManageEvents = () => {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState(null);
  const [filterStatus, setFilter]   = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events?createdByMe=true')
      .then(setEvents)
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    setActionId(eventId);
    try {
      await api.put(`/events/${eventId}`, { status: newStatus });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      const msgs = { ongoing: '🔴 Event is now LIVE!', completed: '✅ Event marked as completed', upcoming: '🔄 Event reopened' };
      toast.success(msgs[newStatus]);
    } catch (err) {
      toast.error(err?.error || 'Status change failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) return;
    setActionId(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err?.error || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  const filtered = filterStatus === 'all' ? events : events.filter(e => e.status === filterStatus);

  const counts = {
    all:       events.length,
    upcoming:  events.filter(e => e.status === 'upcoming').length,
    ongoing:   events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-6">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccff00]/4 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
            <Settings size={13} className="animate-spin-slow" />
            <span>Command Center</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="text-5xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Manage <span className="text-[#ccff00]">Events</span>
            </h1>
            <button
              onClick={() => navigate('/create-event')}
              className="flex items-center gap-2 bg-[#ccff00] text-black px-5 py-3 rounded-2xl font-black italic uppercase text-xs hover:bg-[#d9ff33] transition-all active:scale-95 self-start sm:self-auto"
            >
              <Zap size={14} fill="currentColor" /> New Event
            </button>
          </div>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-4 gap-3 mb-8"
        >
          {[
            { key: 'all',       label: 'Total',     color: 'text-white' },
            { key: 'upcoming',  label: 'Upcoming',  color: 'text-[#ccff00]' },
            { key: 'ongoing',   label: 'Live',      color: 'text-green-400' },
            { key: 'completed', label: 'Done',      color: 'text-gray-400' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`bg-[#111] border rounded-2xl p-4 text-center transition-all hover:border-white/20 ${
                filterStatus === s.key ? 'border-[#ccff00]/40 bg-[#ccff00]/5' : 'border-white/5'
              }`}
            >
              <p className={`text-2xl font-black italic ${s.color}`}>{counts[s.key]}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-0.5">{s.label}</p>
            </button>
          ))}
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-14 h-14 border-2 border-white/5 rounded-full" />
              <div className="w-14 h-14 border-2 border-t-[#ccff00] rounded-full animate-spin absolute inset-0" />
            </div>
          </div>

        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-[#111] border border-dashed border-white/10 rounded-3xl"
          >
            <Trophy size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-2">No Events Yet</h3>
            <p className="text-gray-600 text-sm mb-6">Create your first event!</p>
            <button onClick={() => navigate('/create-event')}
              className="bg-[#ccff00] text-black px-6 py-3 rounded-2xl font-black italic uppercase text-xs hover:bg-[#d9ff33] transition-all"
            >
              Create Event <ChevronRight size={12} className="inline" />
            </button>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-[#111] border border-white/5 rounded-3xl"
          >
            <p className="text-gray-600 font-bold uppercase text-sm">
              No <span className="text-white">{filterStatus}</span> events
            </p>
            <button onClick={() => setFilter('all')} className="text-[#ccff00] text-xs font-black uppercase mt-3 hover:underline">
              Show All
            </button>
          </motion.div>

        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((event, idx) => {
                const cfg    = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
                const nextS  = NEXT_STATUS[event.status];
                const NextIcon = nextS?.icon;
                const isBusy = actionId === event.id;

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all group flex flex-col"
                  >
                    {/* Color top strip */}
                    <div className={`h-[3px] w-full ${
                      event.status === 'ongoing' ? 'bg-green-500' :
                      event.status === 'completed' ? 'bg-gray-600' : 'bg-[#ccff00]'
                    }`} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Top row — sport badge + status */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 text-gray-400 border border-white/5">
                          {event.sport}
                        </span>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${event.status === 'ongoing' ? 'animate-pulse' : ''}`} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Event name */}
                      <h3 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-[#ccff00] transition-colors leading-tight mb-4 flex-1">
                        {event.event_name}
                      </h3>

                      {/* Info rows */}
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 uppercase">
                          <FaCalendarAlt size={10} className="text-[#ccff00] flex-shrink-0" />
                          <span>{format(new Date(event.date_time), 'MMM dd, yyyy • hh:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 uppercase">
                          <FaMapMarkerAlt size={10} className="text-[#ccff00] flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 uppercase">
                          <FaUsers size={10} className="text-[#ccff00] flex-shrink-0" />
                          <span>{event.participant_count || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 uppercase">
                          <Clock size={10} className="text-[#ccff00] flex-shrink-0" />
                          <span>Deadline: {format(new Date(event.registration_deadline), 'MMM dd, hh:mm a')}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        {/* Status change */}
                        {nextS && (
                          <button
                            onClick={() => handleStatusChange(event.id, nextS.value)}
                            disabled={isBusy}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-40 ${nextS.cls}`}
                          >
                            {isBusy
                              ? <FaSpinner size={10} className="animate-spin" />
                              : <NextIcon size={11} />
                            }
                            {nextS.label}
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/events/${event.id}/edit`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-white/5 text-gray-400 hover:bg-[#ccff00]/10 hover:text-[#ccff00] transition-all"
                        >
                          <Pencil size={11} /> Edit
                        </button>

                        {/* View detail */}
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                          <Eye size={11} /> View
                        </button>

                        {/* Delete — spacer push right */}
                        <button
                          onClick={() => handleDelete(event.id, event.event_name)}
                          disabled={isBusy}
                          className="ml-auto flex items-center justify-center w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                        >
                          {isBusy
                            ? <FaSpinner size={10} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
