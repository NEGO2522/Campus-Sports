import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const EventMatches = ({ eventId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const matchesSnap = await getDocs(collection(db, 'events', eventId, 'matches'));
        const matchList = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMatches(matchList);
      } catch (err) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchMatches();
  }, [eventId]);

  if (loading) {
    return <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!matches.length) {
    return <div className="text-center text-gray-500 py-4">No matches found for this event.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <span className="text-lg font-bold text-gray-800">Matches</span>
          <span className="ml-2 text-sm text-gray-500">({matches.length})</span>
        </div>
        <div className="text-gray-400">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900 text-base">
                      {match.round ? (
                        <span className="text-blue-700 font-bold mr-2">{match.round}</span>
                      ) : null}
                      {match.matchName || match.title || 'Match'}
                    </div>
                    {match.status === 'live' && (
                      <div className="flex items-center ml-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs font-bold text-red-600">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div className="text-lg text-black font-medium mt-1 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>{(match.team1?.name || match.team1) || 'Team 1'}</div>
                      <div>vs</div>
                      <div>{(match.team2?.name || match.team2) || 'Team 2'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 mb-1">Location: {match.location}</div>
                  <div className="text-xs text-gray-700 mb-1">
                    Date & Time: {(() => {
                      if (!match.dateTime) return 'N/A';
                      let dateObj;
                      if (typeof match.dateTime.toDate === 'function') {
                        dateObj = match.dateTime.toDate();
                      } else {
                        dateObj = new Date(match.dateTime);
                      }
                      if (isNaN(dateObj.getTime())) return 'N/A';
                      return format(dateObj, 'MMM dd, yyyy • h:mm a');
                    })()}
                  </div>
                  {match.description && <div className="text-xs text-gray-500 mt-1">{match.description}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMatches;
