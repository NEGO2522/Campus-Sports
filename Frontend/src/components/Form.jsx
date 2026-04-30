import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getUser, setAuth } from '../utils/auth';
import api from '../utils/api';
import {
  User, Phone, Hash, BookOpen, Calendar,
  Building2, ChevronRight, ChevronLeft,
  Trophy, Zap, Star, Shield, Search, X, Check, Loader2
} from 'lucide-react';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Badminton', 'Volleyball', 'Tennis', 'Table Tennis', 'Athletics'];
const GENDERS = ['Male', 'Female', 'Other'];
const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, desc: 'Who are you?' },
  { id: 2, title: 'College', icon: Building2, desc: 'Where do you study?' },
  { id: 3, title: 'Sports', icon: Trophy, desc: 'What do you play?' },
];

const UserProfileForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [colleges, setColleges] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeList, setShowCollegeList] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const collegeRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', age: '', gender: '',
    registrationNumber: '', courseName: '', collegeId: '',
    sportPreferences: [],
  });

  const user = getUser();

  // Fetch colleges + prefill existing profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch colleges
        const collegeData = await api.get('/users/colleges');
        setColleges(collegeData);

        // Fetch existing profile for pre-fill
        const profile = await api.get('/users/me');

        setFormData({
          fullName: profile.full_name || user?.fullName || '',
          phoneNumber: profile.phone || '',
          age: profile.age ? String(profile.age) : '',
          gender: profile.gender || '',
          registrationNumber: profile.registration_number || '',
          courseName: profile.course_name || '',
          collegeId: profile.college_id || '',
          sportPreferences: profile.sport_preferences || [],
        });

        // Pre-select college in dropdown
        if (profile.college_id && profile.college_name) {
          setSelectedCollege({ id: profile.college_id, name: profile.college_name });
          setCollegeSearch(profile.college_name);
        }

      } catch (err) {
        // Profile not found — just pre-fill name
        if (user?.fullName) {
          setFormData(prev => ({ ...prev, fullName: user.fullName }));
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (collegeRef.current && !collegeRef.current.contains(e.target)) setShowCollegeList(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.city.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleSelectCollege = (c) => {
    setSelectedCollege(c);
    setFormData(prev => ({ ...prev, collegeId: c.id }));
    setCollegeSearch(c.name);
    setShowCollegeList(false);
  };

  const handleAgeChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 2) setFormData(prev => ({ ...prev, age: val }));
  };

  const toggleSport = (sport) => {
    setFormData(prev => ({
      ...prev,
      sportPreferences: prev.sportPreferences.includes(sport)
        ? prev.sportPreferences.filter(s => s !== sport)
        : [...prev.sportPreferences, sport]
    }));
  };

  const validate = () => {
    if (step === 1 && (!formData.fullName || !formData.phoneNumber || !formData.age || !formData.gender)) {
      toast.error('Please fill all fields'); return false;
    }
    if (step === 2 && (!formData.registrationNumber || !formData.courseName || !formData.collegeId)) {
      toast.error('Please fill college information'); return false;
    }
    if (step === 3 && formData.sportPreferences.length === 0) {
      toast.error('Please select at least one sport'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.put('/users/profile', {
        fullName: formData.fullName, phone: formData.phoneNumber,
        age: parseInt(formData.age), gender: formData.gender,
        registrationNumber: formData.registrationNumber,
        courseName: formData.courseName, collegeId: formData.collegeId,
        sportPreferences: formData.sportPreferences,
      });
      const token = localStorage.getItem('cl_token');
      setAuth(token, { ...user, profileCompleted: true, collegeId: formData.collegeId });
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.error || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00] transition-all font-medium text-sm";
  const label = "block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2";

  // Loading state when profile is being fetched
  if (isLoadingProfile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-[#ccff00] mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccff00]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24 sm:py-28">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-[#ccff00] rounded-2xl text-black mb-5 rotate-3 shadow-lg shadow-[#ccff00]/20"
            >
              <Shield size={28} strokeWidth={2.5} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter"
            >
              Your <span className="text-[#ccff00]">Profile</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em] mt-2"
            >
              {STEPS[step - 1].desc} • Step {step}/{STEPS.length}
            </motion.p>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((s) => (
              <div key={s.id} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/5">
                <motion.div
                  className="h-full bg-[#ccff00] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: step >= s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>

          {/* Step Tabs */}
          <div className="flex justify-between mb-6 bg-white/5 rounded-2xl p-1.5">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <button key={s.id} type="button" onClick={() => isDone && setStep(s.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    isActive ? 'bg-[#ccff00] text-black shadow-sm' :
                    isDone ? 'text-[#ccff00] hover:bg-white/5 cursor-pointer' :
                    'text-gray-600 cursor-default'
                  }`}>
                  {isDone ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
              className="bg-[#111] border border-white/8 rounded-3xl p-5 sm:p-7 shadow-xl"
            >

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input name="fullName" value={formData.fullName}
                        onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                        className={inputBase + ' pl-10'} placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className={label}>Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input type="tel" value={formData.phoneNumber}
                        onChange={e => {
                          const v = e.target.value.replace(/[^0-9]/g, '');
                          if (v.length <= 10) setFormData(p => ({ ...p, phoneNumber: v }));
                        }}
                        className={inputBase + ' pl-10'} placeholder="10 digit mobile" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>Age</label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input type="text" inputMode="numeric" value={formData.age}
                          onChange={handleAgeChange} className={inputBase + ' pl-10'} placeholder="20" />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Gender</label>
                      <div className="grid grid-cols-3 gap-1.5 h-[46px]">
                        {GENDERS.map(g => {
                          const sel = formData.gender === g.toLowerCase();
                          return (
                            <button key={g} type="button"
                              onClick={() => setFormData(p => ({ ...p, gender: g.toLowerCase() }))}
                              className={`rounded-xl text-[10px] font-black uppercase tracking-wide transition-all h-full ${
                                sel ? 'bg-[#ccff00] text-black border-2 border-[#ccff00]' :
                                'bg-[#0a0a0a] border border-white/10 text-gray-500 hover:border-white/20'
                              }`}>
                              {g.slice(0, 2)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>Registration Number</label>
                    <div className="relative">
                      <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input name="registrationNumber" value={formData.registrationNumber}
                        onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))}
                        className={inputBase + ' pl-10'} placeholder="e.g. 2024/18489" />
                    </div>
                  </div>
                  <div>
                    <label className={label}>Course / Branch</label>
                    <div className="relative">
                      <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input name="courseName" value={formData.courseName}
                        onChange={e => setFormData(p => ({ ...p, courseName: e.target.value }))}
                        className={inputBase + ' pl-10'} placeholder="e.g. B.Tech CSE" />
                    </div>
                  </div>
                  <div ref={collegeRef}>
                    <label className={label}>College</label>
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 z-10" />
                      <input type="text" value={collegeSearch}
                        onChange={e => {
                          setCollegeSearch(e.target.value);
                          setSelectedCollege(null);
                          setFormData(p => ({ ...p, collegeId: '' }));
                          setShowCollegeList(true);
                        }}
                        onFocus={() => setShowCollegeList(true)}
                        className={inputBase + ' pl-10 pr-9'}
                        placeholder="Search your college..." autoComplete="off" />
                      {collegeSearch && (
                        <button type="button"
                          onClick={() => { setCollegeSearch(''); setSelectedCollege(null); setFormData(p => ({ ...p, collegeId: '' })); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                          <X size={14} />
                        </button>
                      )}
                      {showCollegeList && collegeSearch && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 max-h-48 overflow-y-auto shadow-2xl">
                          {filteredColleges.length === 0
                            ? <p className="p-4 text-center text-gray-600 text-xs font-bold uppercase">No results</p>
                            : filteredColleges.map(c => (
                              <button key={c.id} type="button" onClick={() => handleSelectCollege(c)}
                                className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-white/5 border-b border-white/5 last:border-0 transition-all ${selectedCollege?.id === c.id ? 'bg-[#ccff00]/10' : ''}`}>
                                <div>
                                  <p className={`text-sm font-bold ${selectedCollege?.id === c.id ? 'text-[#ccff00]' : 'text-white'}`}>{c.name}</p>
                                  <p className="text-[10px] text-gray-600 uppercase mt-0.5">{c.city}, {c.state}</p>
                                </div>
                                {selectedCollege?.id === c.id && <Check size={14} className="text-[#ccff00]" />}
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                    {selectedCollege && (
                      <div className="mt-2 flex items-center gap-2 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl px-3 py-2">
                        <Check size={12} className="text-[#ccff00]" />
                        <span className="text-[11px] font-black text-[#ccff00] uppercase truncate">{selectedCollege.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2.5 bg-white/3 border border-white/5 rounded-xl px-3.5 py-3">
                    <Zap size={13} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      You will only see events from students at your college.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>Sports played</label>
                    <p className="text-[11px] text-gray-600 mb-3">You can select multiple</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SPORTS.map(sport => {
                        const sel = formData.sportPreferences.includes(sport);
                        return (
                          <button key={sport} type="button" onClick={() => toggleSport(sport)}
                            className={`py-2.5 px-3.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all flex items-center gap-2 ${
                              sel ? 'border-[#ccff00] bg-[#ccff00] text-black' :
                              'border-white/10 bg-[#0a0a0a] text-gray-500 hover:border-white/20 hover:text-gray-400'
                            }`}>
                            {sel && <Check size={11} strokeWidth={3} />}
                            {sport}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {formData.sportPreferences.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#ccff00]/8 border border-[#ccff00]/20 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] mb-1">
                        Selected ({formData.sportPreferences.length})
                      </p>
                      <p className="text-sm text-white font-bold leading-snug">
                        {formData.sportPreferences.join(' • ')}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            {step > 1 && (
              <button onClick={() => setStep(p => p - 1)}
                className="flex items-center gap-2 px-5 py-4 bg-white/5 border border-white/10 text-white font-black italic uppercase text-xs rounded-2xl hover:bg-white/8 transition-all">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length ? (
              <button onClick={() => { if (validate()) setStep(p => p + 1); }}
                className="flex-1 py-4 bg-[#ccff00] text-black font-black italic uppercase text-sm rounded-2xl hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 py-4 bg-[#ccff00] text-black font-black italic uppercase text-sm rounded-2xl hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                {isSubmitting
                  ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <><Trophy size={16} /> Save Profile</>
                }
              </button>
            )}
          </div>

          <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-5">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
