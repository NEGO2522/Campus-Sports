import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Settings, Zap, Trash2, Edit3, Play, Pause } from 'lucide-react';

// No Firebase. All data from backend API.
// TODO: import api from '../../utils/api';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [actionId, setActionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        // TODO: const data = await api.get('/events?createdByMe=true');
        // setEvents(data);
        setEvents([]); // empty until backend connected
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchMyEvents();
  }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      setActionId(eventId);
      // TODO: await api.put(`/events/${eventId}`, { status: newStatus });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      toast.success(newStatus === 'ongoing' ? 'Tournament is LIVE!' : 'Tournament paused');
    } catch {
      toast.error('Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event? Cannot be undone.')) return;
    try {
      setActionId(eventId);
      // TODO: await api.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black font-sans py-24 px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccff00]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3 text-[#ccff00]">
              <Settings size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Command Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Manage <span className="text-[#ccff00]">Arenas</span>
            </h1>
          </div>
          <button onClick={() => navigate('/create-event')}
            className="group flex items-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-black italic uppercase text-xs hover:bg-[#ccff00] transition-all"
          >
            Deploy New Arena <Zap size={16} fill="currentColor" />
          </button>
        </motion.div>

        {loadingEvents ? (
          <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-[#ccff00]" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10">
            <Settings className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">No Arenas Found</h3>
            <p className="text-gray-500 mt-2 font-medium">Koi tournament abhi nahi create kiya.</p>
            <button onClick={() => navigate('/create-event')}
              className="mt-6 bg-[#ccff00] text-black px-8 py-3 rounded-full font-black italic uppercase text-xs hover:scale-105 transition-transform"
            >
              Deploy First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div key={event.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#ccff00]/30 transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      event.status === 'ongoing' ? 'bg-green-500/10 text-green-500' : 'bg-[#ccff00]/10 text-[#ccff00]'
                    }`}>
                      {event.sport}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full animate-pulse ${event.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className="text-[10px] font-black text-gray-500 uppercase">{event.status}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black italic text-white uppercase mb-4 leading-tight group-hover:text-[#ccff00] transition-colors">
                    {event.event_name}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase gap-3">
                      <FaCalendarAlt className="text-[#ccff00]" />
                      {format(new Date(event.date_time), 'MMM dd, yyyy • hh:mm a')}
                    </div>
                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase gap-3">
                      <FaMapMarkerAlt className="text-[#ccff00]" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-2">
                      {event.status === 'upcoming' ? (
                        <button onClick={() => handleStatusChange(event.id, 'ongoing')} disabled={actionId === event.id}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500 text-black hover:scale-110 transition-transform"
                        >
                          {actionId === event.id ? <FaSpinner className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(event.id, 'upcoming')} disabled={actionId === event.id}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                        >
                          {actionId === event.id ? <FaSpinner className="animate-spin" /> : <Pause size={16} fill="currentColor" />}
                        </button>
                      )}
                      <button onClick={() => navigate(`/events/${event.id}`)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                    <button onClick={() => handleDelete(event.id)} disabled={actionId === event.id}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      {actionId === event.id ? <FaSpinner className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
