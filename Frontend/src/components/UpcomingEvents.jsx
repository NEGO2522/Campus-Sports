import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaChevronDown, FaChevronUp, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const UpcomingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState({ open: false, eventId: null });
  const [saving, setSaving] = useState(false);
  const [participatingEvents, setParticipatingEvents] = useState({});

  const toggleEventDetails = (e, eventId) => {
    e.stopPropagation();
    setShowDetails(showDetails === eventId ? null : eventId);
  };

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date();
      const eventsData = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() };
        const eventDate = eventData.dateTime?.toDate ? eventData.dateTime.toDate() : new Date(eventData.dateTime);
        
        if (eventDate >= now) {
          eventsData.push({
            ...eventData,
            dateTime: eventDate
          });
        }
      });
      
      eventsData.sort((a, b) => a.dateTime - b.dateTime);
      setEvents(eventsData);

      const user = auth.currentUser;
      if (user) {
        const participationMap = {};
        eventsData.forEach(event => {
          let participated = false;
          if (Array.isArray(event.participants) && event.participants.includes(user.uid)) {
            participated = true;
          }
          if (event.team && typeof event.team === 'object') {
            Object.values(event.team).forEach(team => {
              if ((Array.isArray(team.members) && team.members.includes(user.uid)) || team.leader === user.uid) {
                participated = true;
              }
            });
          }
          participationMap[event.id] = participated;
        });
        setParticipatingEvents(participationMap);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-10 bg-[#0a0a0a] border border-white/5">
        <FaCalendarAlt className="mx-auto text-gray-800 text-3xl mb-4" />
        <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">No upcoming fixtures found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const isPlayersFull = (event.participants?.length || 0) >= (event.playersNeeded || 0);
        const isTeamsFull = event.participationType === 'team' && 
                           Object.keys(event.team || {}).length >= (event.teamsNeeded || 0);
        const isFull = event.participationType === 'team' ? isTeamsFull : isPlayersFull;
        const isParticipating = participatingEvents[event.id];

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group bg-[#0a0a0a] border-l-4 ${isFull ? 'border-l-red-600' : 'border-l-green-500'} border-y border-r border-white/5 hover:border-white/20 transition-all`}
          >
            <div className="p-4 sm:p-6" onClick={() => onEventClick && onEventClick(event)}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left Side: Date and Time */}
                <div className="flex items-center gap-6 min-w-[180px]">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-green-500 tracking-tighter">
                      {format(event.dateTime, 'MMM')}
                    </p>
                    <p className="text-3xl font-black italic leading-none">
                      {format(event.dateTime, 'dd')}
                    </p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                      {format(event.dateTime, 'EEEE')}
                    </p>
                    <p className="text-sm font-black text-white italic">
                      {format(event.dateTime, 'HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Middle: Event Title and Sport */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-gray-400 uppercase border border-white/10">
                      {event.sport}
                    </span>
                    {event.location?.toLowerCase().includes('poornima') && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-green-500/10 text-green-500 uppercase">Featured</span>
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-green-500 transition-colors">
                    {event.eventName}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-bold uppercase text-gray-500">
                    <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-green-500"/> {event.location}</span>
                    <span className="flex items-center gap-1">
                      <FaUsers className={isFull ? 'text-red-500' : 'text-green-500'}/> 
                      {event.participationType === 'team' 
                        ? `${Object.keys(event.team || {}).length}/${event.teamsNeeded} Teams`
                        : `${event.participants?.length || 0}/${event.playersNeeded} Players`
                      }
                    </span>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2">
                  <button
                    onClick={(e) => toggleEventDetails(e, event.id)}
                    className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {showDetails === event.id ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                  </button>

                  <button
                    disabled={isFull || isParticipating || saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (event.participationType === 'player') {
                        setShowConfirm({ open: true, eventId: event.id });
                      } else {
                        navigate(`/events/${event.id}/participate`);
                      }
                    }}
                    className={`flex-1 sm:w-32 py-3 px-4 font-black uppercase italic text-xs tracking-widest transition-all
                      ${isParticipating 
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
                        : isFull 
                          ? 'bg-red-600/20 text-red-500 border border-red-600/50 cursor-not-allowed' 
                          : 'bg-green-500 text-black hover:bg-green-400 active:scale-95'}`}
                  >
                    {isParticipating ? 'Joined' : isFull ? 'Closed' : 'Join'}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              <AnimatePresence>
                {showDetails === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2">Description</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{event.description || 'No additional details available for this fixture.'}</p>
                      </div>
                      <div className="bg-white/5 p-4 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase text-green-500 mb-3 flex items-center gap-2">
                          <FaClock /> Registration Info
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Deadline:</span>
                            <span className="font-bold text-white uppercase">
                              {event.registrationDeadline ? format(new Date(event.registrationDeadline), 'MMM dd, HH:mm') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Mode:</span>
                            <span className="font-bold text-white uppercase">{event.participationType} Entry</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {/* Sporty Confirmation Modal */}
      {showConfirm.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0a] border border-green-500 p-8 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <FaUsers className="text-green-500 text-2xl" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Confirm Entry?</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Are you ready to join this fixture? You will be registered as a player immediately.</p>
            <div className="flex gap-3">
              <button
                disabled={saving}
                className="flex-1 py-3 bg-green-500 text-black font-black uppercase italic tracking-widest hover:bg-green-400"
                onClick={async () => {
                  setSaving(true);
                  try {
                    const user = auth.currentUser;
                    if (!user) return alert('Login required');
                    const eventRef = doc(db, 'events', showConfirm.eventId);
                    await updateDoc(eventRef, { participants: arrayUnion(user.uid) });
                    setShowConfirm({ open: false, eventId: null });
                    setParticipatingEvents(prev => ({ ...prev, [showConfirm.eventId]: true }));
                  } catch (error) {
                    console.error(error);
                  } finally { setSaving(false); }
                }}
              >
                {saving ? 'Processing...' : 'Confirm'}
              </button>
              <button
                disabled={saving}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-widest hover:bg-white/10"
                onClick={() => setShowConfirm({ open: false, eventId: null })}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;