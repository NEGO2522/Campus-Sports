import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTrophy,
  FaUserCircle, FaSpinner
} from 'react-icons/fa';
import { MapPin, Clock, Users, Zap, ArrowLeft, UserPlus, CheckCircle, Shield, Share2 } from 'lucide-react';
import api from '../utils/api';
import { getUser } from '../utils/auth';

const SPORT_META = {
  Cricket:        { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', glow: '#10b981', emoji: '🏏' },
  Football:       { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    glow: '#3b82f6', emoji: '⚽' },
  Basketball:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  glow: '#f97316', emoji: '🏀' },
  Badminton:      { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  glow: '#eab308', emoji: '🏸' },
  Volleyball:     { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  glow: '#a855f7', emoji: '🏐' },
  Tennis:         { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     glow: '#ef4444', emoji: '🎾' },
  'Table Tennis': { color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    glow: '#ec4899', emoji: '🏓' },
};
const DEFAULT_META = { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', glow: '#ccff00', emoji: '🏆' };

const STATUS_STYLE = {
  upcoming:  { badge: 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]', label: 'Upcoming' },
  ongoing:   { badge: 'bg-green-500/10 border-green-500/30 text-green-400', label: '🔴 Live' },
  completed: { badge: 'bg-gray-500/10 border-gray-500/30 text-gray-500',    label: 'Ended' },
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/events/${id}`);
        setEvent(data);
        setParticipants(data.participants || []);
        const joined = (data.participants || []).some(p => p.id === currentUser?.id);
        setHasJoined(joined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    if (hasJoined) return;
    setJoining(true);
    try {
      await api.post(`/events/${id}/join`);
      setHasJoined(true);
      setParticipants(prev => [...prev, {
        id: currentUser?.id,
        full_name: currentUser?.fullName,
      }]);
    } catch (err) {
      alert(err.error || 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="relative">
        <div className="w-14 h-14 border-2 border-white/5 rounded-full" />
        <div className="w-14 h-14 border-2 border-t-[#ccff00] rounded-full animate-spin absolute inset-0" />
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
        <Zap size={32} className="text-gray-700" />
      </div>
      <p className="text-gray-500 font-black italic uppercase tracking-widest">Event not found</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-xs font-black text-[#ccff00] uppercase tracking-widest border border-[#ccff00]/30 bg-[#ccff00]/10 px-5 py-2.5 rounded-xl hover:bg-[#ccff00] hover:text-black transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );

  const meta = SPORT_META[event.sport] || DEFAULT_META;
  const statusStyle = STATUS_STYLE[event.status] || STATUS_STYLE.upcoming;
  const spotsLeft = event.players_needed - participants.length;
  const isFull = spotsLeft <= 0;
  const isDeadlinePassed = new Date() > new Date(event.registration_deadline);
  const fillPct = Math.min((participants.length / (event.players_needed || 1)) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 sm:px-6">
      {/* Sport-tinted ambient glow */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] blur-[160px] rounded-full pointer-events-none opacity-10"
        style={{ background: meta.glow }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back + Share row */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl"
          >
            {copied ? (
              <><CheckCircle size={12} className="text-[#ccff00]" /> Copied!</>
            ) : (
              <><Share2 size={12} /> Share</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT — Main Info ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden"
            >
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${meta.glow}cc, ${meta.glow}20)` }}
              />

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${meta.color} ${meta.bg} ${meta.border}`}>
                        {meta.emoji} {event.sport}
                      </span>
                      <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter leading-tight">
                      {event.event_name}
                    </h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                      By {event.creator_name} • {event.college_name}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <div className="relative mb-6">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${meta.glow}, transparent)` }}
                    />
                    <p className="text-gray-400 text-sm leading-relaxed pl-4">
                      {event.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: FaCalendarAlt,
                      label: 'Date & Time',
                      value: event.date_time ? format(new Date(event.date_time), 'MMM dd, yyyy • hh:mm a') : '—',
                    },
                    {
                      icon: FaMapMarkerAlt,
                      label: 'Location',
                      value: event.location,
                    },
                    {
                      icon: FaUsers,
                      label: 'Format',
                      value: event.participation_type === 'team'
                        ? `Team (${event.team_size} players each)`
                        : 'Individual / Solo',
                    },
                    {
                      icon: Clock,
                      label: 'Reg. Deadline',
                      value: event.registration_deadline
                        ? format(new Date(event.registration_deadline), 'MMM dd, yyyy • hh:mm a')
                        : '—',
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 bg-white/4 hover:bg-white/6 rounded-2xl px-4 py-3.5 transition-colors border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${meta.glow}18` }}>
                        <item.icon size={12} style={{ color: meta.glow }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-[13px] font-bold text-white leading-snug">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Participants Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#ccff00]/10 rounded-xl flex items-center justify-center">
                    <Users size={16} className="text-[#ccff00]" />
                  </div>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">
                    Squad <span className="text-[#ccff00]">({participants.length})</span>
                  </h2>
                </div>

                {event.players_needed > 0 && (
                  <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${
                    isFull
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : spotsLeft <= 3
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      : 'bg-[#ccff00]/10 border-[#ccff00]/20 text-[#ccff00]'
                  }`}>
                    {isFull ? '🔒 Full' : `${spotsLeft} spots left`}
                  </div>
                )}
              </div>

              {event.players_needed > 0 && (
                <div className="mb-5">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        background: fillPct >= 90
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : `linear-gradient(90deg, #ccff00, #a3cc00)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-gray-700 font-bold uppercase">{participants.length} joined</span>
                    <span className="text-[9px] text-gray-700 font-bold uppercase">{event.players_needed} max</span>
                  </div>
                </div>
              )}

              {participants.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FaUsers className="text-gray-700 text-lg" />
                  </div>
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                    No participants yet — be the first to join!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {participants.map((p, i) => (
                    <motion.div
                      key={p.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                        p.id === currentUser?.id
                          ? 'bg-[#ccff00]/5 border-[#ccff00]/20'
                          : 'bg-white/3 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{
                          background: p.id === currentUser?.id ? '#ccff0020' : '#ffffff08',
                          color: p.id === currentUser?.id ? '#ccff00' : '#6b7280',
                        }}
                      >
                        {p.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-white truncate leading-tight">{p.full_name}</p>
                        {p.registration_number && (
                          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-wide">{p.registration_number}</p>
                        )}
                      </div>

                      {p.id === currentUser?.id && (
                        <span className="text-[8px] font-black text-[#ccff00] uppercase tracking-wider bg-[#ccff00]/10 px-2 py-0.5 rounded-md flex-shrink-0">
                          You
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT — Join + Stats ── */}
          <div className="space-y-4">

            {/* Join Card */}
            {event.status === 'upcoming' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-28 overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none opacity-20"
                  style={{ background: meta.glow }}
                />

                <div className="relative z-10">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter mb-5">
                    {hasJoined ? "You're In! 🎉" : 'Join Event'}
                  </h3>

                  <AnimatePresence mode="wait">
                    {hasJoined ? (
                      <motion.div
                        key="joined"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <div
                          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border"
                          style={{ background: `${meta.glow}15`, borderColor: `${meta.glow}30` }}
                        >
                          <CheckCircle size={36} style={{ color: meta.glow }} />
                        </div>
                        <p className="text-base font-black text-white uppercase italic">Registered!</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">
                          Good luck, champ 🏆
                        </p>
                      </motion.div>
                    ) : isDeadlinePassed ? (
                      <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-4">
                          <p className="text-xs font-black text-red-400 uppercase tracking-widest">Registration Closed</p>
                          <p className="text-[9px] text-red-500/60 mt-1 uppercase font-bold">Deadline has passed</p>
                        </div>
                      </motion.div>
                    ) : isFull ? (
                      <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Event Full</p>
                          <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold">All spots are taken</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button
                          onClick={handleJoin}
                          disabled={joining}
                          className="w-full font-black italic uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] text-black text-sm"
                          style={{ background: 'linear-gradient(135deg, #ccff00, #a3cc00)' }}
                        >
                          {joining ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <><UserPlus size={18} /> Join Now</>
                          )}
                        </button>

                        <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-3">
                          Free • No registration fee
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!hasJoined && event.players_needed > 0 && (
                    <div className="mt-5 pt-5 border-t border-white/5">
                      <div className="flex justify-between text-[9px] font-black uppercase text-gray-600 mb-2">
                        <span>{participants.length} joined</span>
                        <span>{event.players_needed} total</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${fillPct}%`,
                            background: `linear-gradient(90deg, ${meta.glow}, ${meta.glow}80)`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} className="text-gray-600" />
                <h3 className="text-[10px] font-black italic uppercase tracking-widest text-gray-500">Event Stats</h3>
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Players Needed', value: event.players_needed || '—' },
                  { label: 'Currently Joined', value: participants.length },
                  { label: 'Participation', value: event.participation_type === 'team' ? 'Team' : 'Solo' },
                  { label: 'Sport', value: `${meta.emoji} ${event.sport}` },
                  { label: 'Status', value: event.status?.charAt(0).toUpperCase() + event.status?.slice(1) },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{s.label}</span>
                    <span className="text-[12px] font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Venue Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${meta.glow}15` }}
                >
                  <MapPin size={14} style={{ color: meta.glow }} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Venue</p>
              </div>
              <p className="text-[13px] font-bold text-white leading-snug">{event.location}</p>
              <p className="text-[10px] text-gray-600 mt-1.5 font-bold uppercase tracking-wide">
                {event.college_name}
                {event.city ? ` • ${event.city}` : ''}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
