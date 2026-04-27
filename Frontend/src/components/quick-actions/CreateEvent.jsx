import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { PlusCircle, Trash2, Clock, MapPin, Zap } from 'lucide-react';

// No Firebase. All data comes from our backend API.
// TODO: import api from '../../utils/api';

const CreateEvent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const [formData, setFormData] = useState({
    eventName: '',
    sport: '',
    dateTime: '',
    registrationDeadline: '',
    location: '',
    description: '',
    participationType: 'player',
    playersNeeded: 10,
    teamsNeeded: 2,
    teamSize: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowForm(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // TODO: Fetch user's events from backend
    // api.get('/events?createdByMe=true&status=upcoming')
    //   .then(data => setUserEvents(data))
    //   .catch(console.error)
    //   .finally(() => setLoadingEvents(false));
    setLoadingEvents(false);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['playersNeeded', 'teamsNeeded', 'teamSize'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName || !formData.sport || !formData.dateTime || !formData.registrationDeadline || !formData.location) {
      toast.error('Required fields missing');
      return;
    }
    try {
      setIsSubmitting(true);

      // TODO: Send to backend
      // const newEvent = await api.post('/events', formData);
      // setUserEvents(prev => [newEvent, ...prev]);
      // toast.success('Event created!');

      toast.success('UI ready — backend se connect hone ke baad save hoga');
      setFormData({
        eventName: '', sport: '', dateTime: '', registrationDeadline: '',
        location: '', description: '', participationType: 'player',
        playersNeeded: 10, teamsNeeded: 2, teamSize: 0,
      });
    } catch (error) {
      toast.error(error.error || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      setDeletingEventId(eventId);

      // TODO: await api.delete(`/events/${eventId}`);
      setUserEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeletingEventId(null);
    }
  };

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all";
  const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-24 px-4 sm:px-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ccff00]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Form */}
          <div className="xl:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[#ccff00]">
                    <PlusCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deployment Unit</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
                    Create New <span className="text-[#ccff00]">Arena</span>
                  </h1>
                </div>
                {isMobile && (
                  <button onClick={() => setShowForm(!showForm)} className="p-3 bg-white/5 rounded-full">
                    <FaChevronDown className={`transition-transform ${showForm ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.form onSubmit={handleSubmit}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8"
                  >
                    <div className="space-y-6">
                      <div>
                        <label className={labelStyle}>Arena Name *</label>
                        <input type="text" name="eventName" value={formData.eventName} onChange={handleInputChange} className={inputStyle} placeholder="E.G., INTER-COLLEGE CRICKET" required />
                      </div>

                      <div>
                        <label className={labelStyle}>Sport *</label>
                        <select name="sport" value={formData.sport} onChange={handleInputChange} className={inputStyle} required>
                          <option value="" className="bg-[#111]">SELECT SPORT</option>
                          {['Football', 'Basketball', 'Tennis', 'Badminton', 'Cricket', 'Volleyball'].map(s => (
                            <option key={s} value={s} className="bg-[#111]">{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>Start *</label>
                          <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleInputChange} className={inputStyle} required />
                        </div>
                        <div>
                          <label className={labelStyle}>Deadline *</label>
                          <input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleInputChange} className={inputStyle} required />
                        </div>
                      </div>

                      <div>
                        <label className={labelStyle}>Location *</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccff00]" />
                          <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={`${inputStyle} pl-12`} placeholder="VENUE NAME / GROUND" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={labelStyle}>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={`${inputStyle} resize-none`} placeholder="RULES, LEVEL, FORMAT..."></textarea>
                      </div>

                      <div>
                        <label className={labelStyle}>Participation Type</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {['player', 'team'].map(type => (
                            <button key={type} type="button"
                              onClick={() => setFormData(prev => ({ ...prev, participationType: type }))}
                              className={`py-3 rounded-xl border-2 font-black italic uppercase text-[10px] tracking-widest transition-all ${
                                formData.participationType === type ? 'border-[#ccff00] bg-[#ccff00] text-black' : 'border-white/10 bg-white/5 text-gray-400'
                              }`}
                            >
                              {type === 'player' ? 'Solo Ops' : 'Team Squads'}
                            </button>
                          ))}
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          {formData.participationType === 'player' ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase text-gray-400">Players Needed</span>
                              <input type="number" name="playersNeeded" value={formData.playersNeeded} onChange={handleInputChange} min="2" className="w-20 bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-center text-[#ccff00] font-black" />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-gray-400">Teams</span>
                                <input type="number" name="teamsNeeded" value={formData.teamsNeeded} onChange={handleInputChange} min="2" className="w-20 bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-center text-[#ccff00] font-black" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-gray-400">Players/Team</span>
                                <input type="number" name="teamSize" value={formData.teamSize} onChange={handleInputChange} min="1" className="w-20 bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-center text-[#ccff00] font-black" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#ccff00]/10 p-4 rounded-2xl border border-[#ccff00]/20 flex gap-4">
                        <Zap size={20} className="text-[#ccff00] shrink-0" />
                        <p className="text-[10px] font-bold text-[#ccff00] uppercase leading-relaxed tracking-wider">
                          Event sirf aapke college ke students ko dikhega — location-based filtering
                        </p>
                      </div>

                      <button type="submit" disabled={isSubmitting}
                        className="w-full bg-white text-black font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-[#ccff00] transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Deploy Arena'}
                        <Zap size={16} fill="currentColor" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#111] border border-white/5 rounded-[2rem] p-6 sticky top-24"
            >
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <Clock size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Active Radar</h2>
              </div>

              {loadingEvents ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-[#ccff00]" /></div>
              ) : userEvents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">No active events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event.id} className="group relative bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-[#ccff00]/30 transition-all">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black text-[#ccff00] uppercase truncate pr-4">{event.event_name}</span>
                        <button onClick={() => handleDeleteEvent(event.id)} disabled={deletingEventId === event.id} className="text-red-500 hover:text-red-400">
                          {deletingEventId === event.id ? <FaSpinner className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase">
                        <Clock size={10} /> {event.date_time ? format(new Date(event.date_time), 'MMM dd, hh:mm a') : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
