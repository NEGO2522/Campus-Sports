import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { FaChevronDown, FaChevronUp, FaCheck, FaEdit, FaPlay, FaPause } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EventMatches = ({ eventId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

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
                <div className="p-4 relative">
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
                  {/* Edit Button */}
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-blue-700"
                    title="Edit Match"
                    onClick={() => navigate(`/events/${eventId}/matches/${match.id}/edit`)}
                  >
                    <FaEdit />
                  </button>
                  <div className="text-lg text-black font-medium mt-1 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {(match.team1?.name || match.team1) || 'Team 1'}
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const safeTeam1 = (match.team1?.name || match.team1 || 'Team 1').replace(/[~*\/\[\]]/g, '_');
                            const team1Key = `score_${safeTeam1}`;
                            return match[team1Key] !== undefined ? `Score: ${match[team1Key]}` : '';
                          })()}
                        </div>
                      </div>
                      <div>vs</div>
                      <div>
                        {(match.team2?.name || match.team2) || 'Team 2'}
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const safeTeam2 = (match.team2?.name || match.team2 || 'Team 2').replace(/[~*\/\[\]]/g, '_');
                            const team2Key = `score_${safeTeam2}`;
                            return match[team2Key] !== undefined ? `Score: ${match[team2Key]}` : '';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 mb-1">Location: {match.location}</div>
                  <div className="text-xs mb-1">
                    {/* Debug: {String(match.matchStarted)} ({typeof match.matchStarted}) */}
                    {(() => {
                      // Only show LIVE if matchStarted is boolean true
                      if (typeof match.matchStarted === 'boolean' && match.matchStarted === true) {
                        return (
                          <span className="flex items-center text-red-600 font-bold">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                            LIVE
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-gray-700">
                            Date & Time: {(() => {
                              if (!match.dateTime) return 'N/A';
                              let dateObj;
                              if (typeof match.dateTime?.toDate === 'function') {
                                dateObj = match.dateTime.toDate();
                              } else {
                                dateObj = new Date(match.dateTime);
                              }
                              if (isNaN(dateObj.getTime())) return 'N/A';
                              return format(dateObj, 'MMM dd, yyyy • h:mm a');
                            })()}
                          </span>
                        );
                      }
                    })()}
                  </div>
                  {/* Start/Pause Button for match */}
                  <div className="mt-2 flex space-x-2">
                    {match.matchStarted === false && (
                      <>
                        <button
                          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 shadow"
                          title="Start Match"
                          onClick={async () => {
                            const matchRef = doc(db, 'events', eventId, 'matches', match.id);
                            await updateDoc(matchRef, { matchStarted: true });
                            setMatches(prev => prev.map(m => m.id === match.id ? { ...m, matchStarted: true } : m));
                          }}
                        >
                          <FaPlay className="w-3 h-3" />
                        </button>
                        <ScoreButton match={match} eventId={eventId} setMatches={setMatches} />
                      </>
                    )}
                    {match.matchStarted === true && (
                      <>
                        <button
                          className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 shadow"
                          title="Pause Match"
                          onClick={async () => {
                            const matchRef = doc(db, 'events', eventId, 'matches', match.id);
                            await updateDoc(matchRef, { matchStarted: false });
                            setMatches(prev => prev.map(m => m.id === match.id ? { ...m, matchStarted: false } : m));
                          }}
                        >
                          <FaPause className="w-3 h-3" />
                        </button>
                        <ScoreButton match={match} eventId={eventId} setMatches={setMatches} />
                      </>
                    )}
                  </div>
                  {match.description && <div className="text-xs text-gray-500 mt-1">{match.description}</div>}
                  {/* Delete Button */}
                  <button
                    className="absolute right-2 bottom-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs font-semibold"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this match?')) {
                        const matchRef = doc(db, 'events', eventId, 'matches', match.id);
                        await deleteDoc(matchRef);
                        setMatches(prev => prev.filter(m => m.id !== match.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ScoreButton component
function ScoreButton({ match, eventId, setMatches }) {
  const [showInput, setShowInput] = useState(false);
  const [score1, setScore1] = useState(match.score1 || '');
  const [score2, setScore2] = useState(match.score2 || '');
  const [saving, setSaving] = useState(false);

  if (!match.matchStarted) return null;

  return (
    <>
      <button
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow ml-2"
        title="Add Score"
        onClick={() => setShowInput(true)}
      >
        Score
      </button>
      {showInput && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 w-80 max-h-[90vh] overflow-y-auto">
          <div className="mb-2 font-semibold text-gray-800">Enter Scores</div>
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm text-gray-700">{(match.team1?.name || match.team1) || 'Team 1'}:</label>
            <input
              type="number"
              value={score1}
              onChange={e => setScore1(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              min="0"
            />
            <label className="text-sm text-gray-700">{(match.team2?.name || match.team2) || 'Team 2'}:</label>
            <input
              type="number"
              value={score2}
              onChange={e => setScore2(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              min="0"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                const matchRef = doc(db, 'events', eventId, 'matches', match.id);
                const safeTeam1 = (match.team1?.name || match.team1 || 'Team 1').replace(/[~*\/[\]]/g, '_');
                const safeTeam2 = (match.team2?.name || match.team2 || 'Team 2').replace(/[~*\/[\]]/g, '_');
                const team1Key = `score_${safeTeam1}`;
                const team2Key = `score_${safeTeam2}`;
                await updateDoc(matchRef, {
                  [team1Key]: Number(score1),
                  [team2Key]: Number(score2)
                });
                setMatches(prev => prev.map(m =>
                  m.id === match.id
                    ? {
                        ...m,
                        [team1Key]: Number(score1),
                        [team2Key]: Number(score2)
                      }
                    : m
                ));
                setSaving(false);
                setShowInput(false);
              }}
            >
              Save
            </button>
            <button
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setShowInput(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default EventMatches;
