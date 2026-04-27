import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { FaMapMarkerAlt, FaBolt, FaChevronRight, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const OngoingEvents = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [matchesByEvent, setMatchesByEvent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingEventsAndMatches = async () => {
      setLoading(true);
      try {
        const eventsSnap = await getDocs(query(collection(db, 'events'), where('status', '==', 'ongoing')));
        const eventsArr = eventsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setEvents(eventsArr);

        const matchesObj = {};
        for (const event of eventsArr) {
          const matchesSnap = await getDocs(collection(db, 'events', event.id, 'matches'));
          matchesObj[event.id] = matchesSnap.docs.map(matchDoc => {
            const match = matchDoc.data();
            let dateTime = match.dateTime?.toDate ? match.dateTime.toDate() : new Date(match.dateTime);
            return {
              ...match,
              id: matchDoc.id,
              matchName: match.round || match.matchName || match.title || 'Match',
              dateTime,
            };
          });
        }
        setMatchesByEvent(matchesObj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOngoingEventsAndMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        {/* Spinner updated to #ccff00 */}
        <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-10 bg-[#0a0a0a] border border-white/5 rounded-none">
        <FaTrophy className="mx-auto text-gray-700 text-3xl mb-4" />
        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No Live Action Currently</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event, index) => {
        const matches = matchesByEvent[event.id] || [];
        const matchesToShow = matches.slice(0, 2);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-[#ccff00]/50 transition-all cursor-pointer"
            onClick={() => onEventClick && onEventClick(event)}
          >
            {/* Live Indicator Top Bar updated to #ccff00 */}
            <div className="h-1 w-full bg-white/5 group-hover:bg-[#ccff00]/30 transition-colors" />

            <div className="p-5">
              {/* Event Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-[#ccff00] transition-colors">
                    {event.eventName || event.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{event.sport || 'Tournament'}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{event.location}</span>
                  </div>
                </div>
                {/* Bolt icon updated to #ccff00 */}
                <div className="bg-white/5 p-2 text-white/20 group-hover:text-[#ccff00] transition-colors">
                  <FaBolt size={14} />
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-3">
                {matchesToShow.length > 0 ? (
                  matchesToShow.map((match) => (
                    <div key={match.id} className="relative bg-black border border-white/5 p-4 group/match hover:border-white/20 transition-all">
                      {/* Match Header */}
                      <div className="flex justify-between items-center mb-3">
                        {/* Match Round Badge updated to #ccff00 */}
                        <span className="text-[9px] font-black text-black uppercase tracking-widest bg-[#ccff00] px-2 py-0.5">
                          {match.matchName}
                        </span>
                        {match.matchStarted ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-red-500 italic uppercase">Live</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-600 uppercase">
                            {match.dateTime ? format(match.dateTime, 'HH:mm') : '--:--'}
                          </span>
                        )}
                      </div>

                      {/* Scoreboard Display */}
                      <div className="space-y-2">
                        {[
                          { team: match.team1?.name || match.team1, score: match[`score_${(match.team1?.name || match.team1 || '').replace(/[~*\/\[\]]/g, '_')}`] },
                          { team: match.team2?.name || match.team2, score: match[`score_${(match.team2?.name || match.team2 || '').replace(/[~*\/\[\]]/g, '_')}`] }
                        ].map((t, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm font-bold uppercase tracking-tight text-gray-300">
                              {t.team || `Team ${i + 1}`}
                            </span>
                            <span className={`text-lg font-black italic ${t.score !== undefined && t.score !== '' ? 'text-white' : 'text-gray-800'}`}>
                              {t.score !== undefined && t.score !== '' ? t.score : '0'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Location Overlay updated to #ccff00 */}
                      {match.location && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center text-[9px] text-gray-500 uppercase font-bold">
                          <FaMapMarkerAlt className="mr-1 text-[#ccff00]/50" />
                          {match.location}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border border-dashed border-white/10">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Awaiting Matchup</span>
                  </div>
                )}
              </div>

              {/* View More Button - Text switches to Black on Volt background hover */}
              {matches.length > 2 && (
                <button className="w-full mt-4 py-2 flex items-center justify-center gap-2 border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all">
                  See All Matches <FaChevronRight size={8} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OngoingEvents;