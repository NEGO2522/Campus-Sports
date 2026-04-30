import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaUser, FaUniversity, FaIdCard, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';
import { ArrowLeft, MapPin, BookOpen, Zap } from 'lucide-react';
import api from '../utils/api';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.get(`/users/${id}`);
        setUser(data);
      } catch (err) {
        setError(err.error || 'User not found');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Generate initials from full name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-white/5 rounded-full" />
          <div className="w-14 h-14 border-2 border-t-[#ccff00] rounded-full animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  // Error / User not found state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 text-white px-4">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-4xl">
          <FaUser className="text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">
            {error || 'User Not Found'}
          </h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            The user you are looking for does not exist
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#ccff00] text-black font-black italic uppercase px-6 py-3 rounded-xl hover:bg-[#d9ff33] transition-all text-xs tracking-widest flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  const displayName = user.full_name || 'Unknown User';
  const initials = getInitials(displayName);
  const sports = Array.isArray(user.sport_preferences) ? user.sport_preferences : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-6">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] blur-[150px] rounded-full pointer-events-none opacity-10 bg-[#ccff00]" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-[#ccff00] font-bold uppercase tracking-[0.3em] text-[10px] mb-3">
            <Zap size={12} className="animate-pulse" />
            <span>Athlete Profile</span>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-6"
        >
          {/* Avatar & Name */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[#ccff00] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-2xl">{initials}</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
                {displayName}
              </h1>
              {user.college_name && (
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                  <FaUniversity size={12} />
                  {user.college_name}
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* College & Course */}
            {user.course_name && (
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#ccff00] mb-2">
                  <BookOpen size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Course</span>
                </div>
                <p className="text-sm font-bold text-white">{user.course_name}</p>
              </div>
            )}

            {/* City */}
            {user.city && (
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#ccff00] mb-2">
                  <MapPin size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">City</span>
                </div>
                <p className="text-sm font-bold text-white">{user.city}</p>
              </div>
            )}

            {/* Registration Number */}
            {user.registration_number && (
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#ccff00] mb-2">
                  <FaIdCard size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Registration No.</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">{user.registration_number}</p>
              </div>
            )}

            {/* Age & Gender */}
            {(user.age || user.gender) && (
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#ccff00] mb-2">
                  <FaVenusMars size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Age & Gender</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {user.age && `${user.age} years`}
                  {user.age && user.gender && ' • '}
                  {user.gender && user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                </p>
              </div>
            )}
          </div>

          {/* Sport Preferences */}
          {sports.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaBirthdayCake size={14} className="text-[#ccff00]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Sport Preferences
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <span
                    key={sport}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[11px] font-bold uppercase tracking-wide"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Joined Date */}
        {user.created_at && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
