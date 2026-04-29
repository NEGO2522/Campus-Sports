import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaSpinner, FaTrash, FaCalendarAlt, FaRunning, FaFutbol, FaBasketballBall, FaTableTennis, FaVolleyballBall, FaUsers, FaSwimmer, FaChess, FaDumbbell, FaBicycle, FaGamepad } from 'react-icons/fa';
import {
  GiCricketBat, GiShuttlecock, GiBoxingGlove,
  GiArcheryTarget, GiTennisRacket, GiWeightLiftingUp,
  GiSoccerKick, GiHockey, GiKickScooter,
  GiRunningShoe, GiKimono, GiFencer
} from 'react-icons/gi';
import {
  PlusCircle, Clock, ChevronRight, ChevronLeft,
  Zap, Target, Users, Calendar, MapPin, FileText,
  Check, Trophy
} from 'lucide-react';
import api from '../../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ONLINE_GAMES = [
  { name: 'Free Fire',        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { name: 'PUBG Mobile',      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { name: 'Valorant',         color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { name: 'BGMI',             color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { name: 'Call of Duty',     color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { name: 'FIFA',             color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { name: 'Clash Royale',     color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { name: 'Clash of Clans',   color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { name: 'Pokemon GO',       color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { name: 'Among Us',         color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { name: 'Minecraft',        color: 'text-lime-400 bg-lime-500/10 border-lime-500/30' },
  { name: 'Other Online',     color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
];

const SPORTS = [
  { name: 'Cricket',        icon: GiCricketBat,       color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { name: 'Football',       icon: FaFutbol,            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { name: 'Basketball',     icon: FaBasketballBall,    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { name: 'Badminton',      icon: GiShuttlecock,       color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { name: 'Volleyball',     icon: FaVolleyballBall,    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { name: 'Table Tennis',   icon: FaTableTennis,       color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { name: 'Tennis',         icon: GiTennisRacket,      color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { name: 'Boxing',         icon: GiBoxingGlove,       color: 'text-red-500 bg-red-600/10 border-red-600/30' },
  { name: 'Archery',        icon: GiArcheryTarget,     color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { name: 'Swimming',       icon: FaSwimmer,           color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { name: 'Athletics',      icon: GiRunningShoe,       color: 'text-lime-400 bg-lime-500/10 border-lime-500/30' },
  { name: 'Hockey',         icon: GiHockey,            color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { name: 'Kabaddi',        icon: GiKimono,            color: 'text-orange-500 bg-orange-600/10 border-orange-600/30' },
  { name: 'Kho-Kho',        icon: GiSoccerKick,        color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { name: 'Cycling',        icon: FaBicycle,           color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { name: 'Chess',          icon: FaChess,             color: 'text-gray-300 bg-gray-500/10 border-gray-500/30' },
  { name: 'Gym/Fitness',    icon: GiWeightLiftingUp,   color: 'text-yellow-500 bg-yellow-600/10 border-yellow-600/30' },
  { name: 'Martial Arts',   icon: GiFencer,            color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { name: 'Skipping',       icon: GiKickScooter,       color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { name: 'Online Gaming',    icon: FaGamepad,           color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30' },
  { name: 'Other',            icon: FaRunning,           color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
];

const STEPS = [
  { id: 1, label: 'Sport',    icon: Trophy },
  { id: 2, label: 'Details',  icon: FileText },
  { id: 3, label: 'Setup',    icon: Users },
  { id: 4, label: 'Confirm',  icon: Check },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    eventName: '', sport: '', dateTime: '', registrationDeadline: '',
    location: '', description: '', participationType: 'player',
    playersNeeded: 10, teamsNeeded: 2, teamSize: 5,
    eventType: 'official'
  });
  const [showOnlineGames, setShowOnlineGames] = useState(false);

  useEffect(() => {
    // createdByMe=true — sirf login user ke events load honge
    api.get('/events?createdByMe=true')
      .then(setUserEvents).catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, []);

  // URL query param se eventType pre-select karo
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl === 'community' || typeFromUrl === 'official') {
      setFormData(p => ({ ...p, eventType: typeFromUrl }));
    }
  }, [searchParams]);

  const selectedSport = SPORTS.find(s => s.name === formData.sport);

  const validateStep = () => {
    if (step === 1 && !formData.sport) {
      toast.error('Ek sport choose karo'); return false;
    }
    if (step === 2) {
      if (!formData.eventName) { toast.error('Event name daalo'); return false; }
      if (!formData.dateTime) { toast.error('Date & time daalo'); return false; }
      // Deadline required only for official events
      if (formData.eventType !== 'community' && !formData.registrationDeadline) {
        toast.error('Deadline daalo'); return false;
      }
      if (!formData.location) { toast.error('Location daalo'); return false; }
      // Deadline validation only if deadline is set
      if (formData.registrationDeadline && new Date(formData.registrationDeadline) >= new Date(formData.dateTime)) {
        toast.error('Deadline event se pehle honi chahiye'); return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(p => p + 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newEvent = await api.post('/events', {
        eventName: formData.eventName,
        sport: formData.sport,
        description: formData.description,
        location: formData.location,
        dateTime: formData.dateTime,
        registrationDeadline: formData.registrationDeadline || (formData.eventType === 'community' ? formData.dateTime : undefined),
        eventType: formData.eventType,
        participationType: formData.participationType,
        playersNeeded: formData.playersNeeded,
        teamsNeeded: formData.teamsNeeded,
        teamSize: formData.teamSize,
      });
      toast.success('Event create ho gaya!');
      if (newEvent?.id) navigate(`/events/${newEvent.id}`);
    } catch (err) {
      toast.error(err.error || 'Kuch galat hua');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete karein?')) return;
    setDeletingId(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      setUserEvents(p => p.filter(ev => ev.id !== eventId));
      toast.success('Deleted');
    } catch { toast.error('Delete nahi hua'); }
    finally { setDeletingId(null); }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00] transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ccff00]/3 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── MAIN WIZARD ── */}
          <div className="xl:col-span-8">

            <div className="mb-8">
              <div className="flex items-center gap-2 text-[#ccff00] text-[10px] font-black uppercase tracking-widest mb-2">
                <PlusCircle size={14} />
                <span>New Event</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
                Create <span className="text-[#ccff00]">Event</span>
              </h1>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isDone ? 'bg-[#ccff00] text-black' :
                        isActive ? 'bg-[#ccff00]/20 text-[#ccff00] border-2 border-[#ccff00]' :
                        'bg-white/5 text-gray-600 border border-white/10'
                      }`}>
                        {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${
                        isActive ? 'text-[#ccff00]' : isDone ? 'text-gray-500' : 'text-gray-700'
                      }`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-[2px] mb-5 mx-2 rounded-full transition-all ${
                        step > s.id ? 'bg-[#ccff00]' : 'bg-white/10'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Form Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 mb-6"
              >

                {/* STEP 1 — Sport */}
                {step === 1 && (
                  <div>
                    {/* Event Type Selector */}
                    <div className="mb-8">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Event Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'official', label: 'Official Event', desc: 'College/Admin organized', icon: Trophy },
                          { value: 'community', label: 'Community Pickup', desc: 'Casual — just show up & play', icon: Zap }
                        ].map((type) => {
                          const Icon = type.icon;
                          const isSelected = formData.eventType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, eventType: type.value }))}
                              className={`flex flex-col gap-1 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                                isSelected
                                  ? 'border-[#ccff00] bg-[#ccff00] text-black'
                                  : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={16} />
                                <span>{type.label}</span>
                              </div>
                              <span className={`text-[9px] normal-case font-medium ${isSelected ? 'text-black/70' : 'text-gray-500'}`}>
                                {type.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1">Kaunsa sport?</h2>
                    <p className="text-xs text-gray-600 mb-6">Ek select karo</p>

                    <AnimatePresence mode="wait">
                      {!showOnlineGames ? (
                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {SPORTS.map(sport => {
                            const Icon = sport.icon;
                            const isSelected = formData.sport === sport.name;
                            return (
                              <button key={sport.name} type="button"
                                onClick={() => {
                                  if (sport.name === 'Online Gaming') { setShowOnlineGames(true); return; }
                                  setFormData(p => ({ ...p, sport: sport.name }));
                                }}
                                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                                  isSelected
                                    ? 'border-[#ccff00] bg-[#ccff00] text-black scale-[1.03]'
                                    : `${sport.color} hover:scale-[1.02]`
                                }`}>
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                    <Check size={10} strokeWidth={3} className="text-[#ccff00]" />
                                  </div>
                                )}
                                <Icon size={28} />
                                {sport.name}
                                {sport.name === 'Online Gaming' && (
                                  <span className="text-[8px] opacity-60 normal-case font-bold">tap to expand</span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      ) : (
                        <motion.div key="online" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <button type="button" onClick={() => setShowOnlineGames(false)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-4 transition-colors">
                            <ChevronLeft size={14} /> Back to all sports
                          </button>
                          <div className="flex items-center gap-2 mb-4">
                            <FaGamepad className="text-fuchsia-400" size={18} />
                            <h3 className="text-sm font-black uppercase tracking-wider text-fuchsia-400">Online Games</h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {ONLINE_GAMES.map(game => {
                              const isSelected = formData.sport === game.name;
                              return (
                                <button key={game.name} type="button"
                                  onClick={() => setFormData(p => ({ ...p, sport: game.name }))}
                                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                                    isSelected
                                      ? 'border-[#ccff00] bg-[#ccff00] text-black scale-[1.03]'
                                      : `${game.color} hover:scale-[1.02]`
                                  }`}>
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                                      <Check size={8} strokeWidth={3} className="text-[#ccff00]" />
                                    </div>
                                  )}
                                  <FaGamepad size={18} />
                                  {game.name}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* STEP 2 — Details */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1">Event details</h2>
                    <p className="text-xs text-gray-600 mb-6">Basic info bharo</p>
                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>Event Name *</label>
                        <input type="text" value={formData.eventName}
                          onChange={e => setFormData(p => ({ ...p, eventName: e.target.value }))}
                          className={inputClass} placeholder="e.g. Inter-Branch Cricket" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Event Date & Time *</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input type="datetime-local" value={formData.dateTime}
                              onChange={e => setFormData(p => ({ ...p, dateTime: e.target.value }))}
                              className={inputClass + ' pl-10'} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Reg. Deadline {formData.eventType === 'community' ? '(Optional)' : '*'}</label>
                          <div className="relative">
                            <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input type="datetime-local" value={formData.registrationDeadline}
                              onChange={e => setFormData(p => ({ ...p, registrationDeadline: e.target.value }))}
                              className={inputClass + ' pl-10'} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Location *</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccff00]" />
                          <input type="text" value={formData.location}
                            onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                            className={inputClass + ' pl-10'} placeholder="Ground / Court name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Description <span className="text-gray-700 normal-case">(optional)</span></label>
                        <textarea value={formData.description}
                          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                          rows={3} className={inputClass + ' resize-none'}
                          placeholder="Rules, format, skill level..." />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Setup */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1">Participation setup</h2>
                    <p className="text-xs text-gray-600 mb-6">Solo ya team based?</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { value: 'player', label: 'Solo / Player', icon: FaRunning, desc: 'Individual entries' },
                        { value: 'team',   label: 'Team Based',   icon: FaUsers,   desc: 'Teams compete' },
                      ].map(opt => {
                        const Icon = opt.icon;
                        const isSelected = formData.participationType === opt.value;
                        return (
                          <button key={opt.value} type="button"
                            onClick={() => setFormData(p => ({ ...p, participationType: opt.value }))}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                              isSelected
                                ? 'border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                            }`}>
                            <Icon size={28} />
                            <div className="text-center">
                              <p className="font-black text-xs uppercase tracking-wide">{opt.label}</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">{opt.desc}</p>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-[#ccff00] rounded-full flex items-center justify-center">
                                <Check size={12} strokeWidth={3} className="text-black" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-5 space-y-4">
                      {formData.participationType === 'player' ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black uppercase">Players Needed</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">Kitne players join kar sakte hain</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button"
                              onClick={() => setFormData(p => ({ ...p, playersNeeded: Math.max(2, p.playersNeeded - 1) }))}
                              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">−</button>
                            <span className="w-10 text-center font-black text-[#ccff00] text-xl">{formData.playersNeeded}</span>
                            <button type="button"
                              onClick={() => setFormData(p => ({ ...p, playersNeeded: p.playersNeeded + 1 }))}
                              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">+</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-black uppercase">Teams</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">Kitni teams compete karengi</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => setFormData(p => ({ ...p, teamsNeeded: Math.max(2, p.teamsNeeded - 1) }))}
                                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">−</button>
                              <span className="w-10 text-center font-black text-[#ccff00] text-xl">{formData.teamsNeeded}</span>
                              <button type="button"
                                onClick={() => setFormData(p => ({ ...p, teamsNeeded: p.teamsNeeded + 1 }))}
                                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">+</button>
                            </div>
                          </div>
                          <div className="h-px bg-white/5" />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-black uppercase">Players per Team</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">Har team mein kitne players</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => setFormData(p => ({ ...p, teamSize: Math.max(1, p.teamSize - 1) }))}
                                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">−</button>
                              <span className="w-10 text-center font-black text-[#ccff00] text-xl">{formData.teamSize}</span>
                              <button type="button"
                                onClick={() => setFormData(p => ({ ...p, teamSize: p.teamSize + 1 }))}
                                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/20 transition-all">+</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex items-start gap-2.5 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-xl px-4 py-3">
                      <Zap size={14} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-400">Event sirf tumhare college ke students ko dikhega</p>
                    </div>
                  </div>
                )}

                {/* STEP 4 — Confirm */}
                {step === 4 && (
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1">Confirm karo</h2>
                    <p className="text-xs text-gray-600 mb-6">Sab theek hai?</p>
                    <div className="space-y-3">
                      {selectedSport && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${selectedSport.color}`}>
                          <selectedSport.icon size={20} />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sport</p>
                            <p className="text-sm font-black">{formData.sport}</p>
                          </div>
                        </div>
                      )}
                      {[
                        { icon: Target,   label: 'Event Name', value: formData.eventName },
                        { icon: Zap,      label: 'Event Type', value: formData.eventType === 'official' ? '🏆 Official Event' : '🏃 Community Pickup' },
                        { icon: MapPin,   label: 'Location',   value: formData.location },
                        { icon: Calendar, label: 'Date & Time',value: formData.dateTime ? format(new Date(formData.dateTime), 'MMM dd, yyyy • hh:mm a') : '—' },
                        { icon: Clock,    label: 'Deadline',   value: formData.registrationDeadline ? format(new Date(formData.registrationDeadline), 'MMM dd, yyyy') : '—' },
                        { icon: Users,    label: 'Type',       value: formData.participationType === 'team' ? `Team — ${formData.teamsNeeded} teams × ${formData.teamSize} players` : `Solo — ${formData.playersNeeded} players` },
                      ].map(item => (
                        <div key={item.label} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                          <item.icon size={14} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{item.label}</p>
                            <p className="text-sm font-bold text-white">{item.value}</p>
                          </div>
                        </div>
                      ))}
                      {formData.description && (
                        <div className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                          <FileText size={14} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Description</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{formData.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(p => p - 1)}
                  className="flex items-center gap-2 px-5 py-4 bg-white/5 border border-white/10 text-white font-black italic uppercase text-xs rounded-2xl hover:bg-white/8 transition-all">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              {step < STEPS.length ? (
                <button onClick={handleNext}
                  className="flex-1 py-4 bg-[#ccff00] text-black font-black italic uppercase rounded-2xl hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting}
                  className="flex-1 py-4 bg-[#ccff00] text-black font-black italic uppercase rounded-2xl hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                  {isSubmitting
                    ? <FaSpinner className="animate-spin" />
                    : <><Zap size={18} fill="currentColor" /> Deploy Event</>
                  }
                </button>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="xl:col-span-4">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={15} className="text-gray-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">My Events</h3>
              </div>
              {loadingEvents ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-[#ccff00]" /></div>
              ) : userEvents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl">
                  <Trophy size={24} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Koi event nahi</p>
                  <p className="text-[9px] text-gray-800 mt-1">Pehla event banao!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userEvents.map(ev => (
                    <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}
                      className="group bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-[#ccff00]/30 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-black text-[#ccff00] uppercase truncate pr-3">{ev.event_name}</span>
                        <button onClick={e => handleDelete(ev.id, e)} disabled={deletingId === ev.id}
                          className="text-red-500/50 hover:text-red-400 flex-shrink-0 transition-colors">
                          {deletingId === ev.id ? <FaSpinner className="animate-spin" size={10} /> : <FaTrash size={10} />}
                        </button>
                      </div>
                      <p className="text-[9px] font-bold text-gray-600 uppercase">{ev.sport}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold text-gray-700 uppercase">
                        <FaCalendarAlt size={8} />
                        {ev.date_time ? format(new Date(ev.date_time), 'MMM dd, hh:mm a') : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
