import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// No Firebase. Data from backend API.
// TODO: import api from '../../utils/api';

const EventMatches = ({ eventId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // TODO: const data = await api.get(`/events/${eventId}/matches`);
        // setMatches(data);
        setMatches([]);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchMatches();
  }, [eventId]);

  const handleToggleMatch = async (matchId, currentState) => {
    try {
      // TODO: await api.put(`/events/${eventId}/matches/${matchId}`, { status: currentState ? 'scheduled' : 'live' });
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: m.status === 'live' ? 'scheduled' : 'live' } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      // TODO: await api.delete(`/events/${eventId}/matches/${matchId}`);
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-[#ccff00]" /></div>;
  }

  if (!matches.length) {
    return <div className="text-center text-gray-500 text-sm py-4 font-bold uppercase tracking-widest">No matches created yet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="text-sm font-black uppercase tracking-widest text-white">
          Matches <span className="text-[#ccff00]">({matches.length})</span>
        </span>
        {expanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </div>

      {expanded && (
        <div className="space-y-3">
          {matches.map((match, idx) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl relative"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest">{match.round}</span>
                {match.status === 'live' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-red-500 uppercase">LIVE</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm font-black mb-3">
                <span>{match.team1_name || 'Team 1'}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#ccff00] text-lg">{match.team1_score ?? 0}</span>
                  <span className="text-gray-600 text-xs">VS</span>
                  <span className="text-[#ccff00] text-lg">{match.team2_score ?? 0}</span>
                </div>
                <span>{match.team2_name || 'Team 2'}</span>
              </div>

              <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">
                {match.location} • {match.match_date ? format(new Date(match.match_date), 'MMM dd, h:mm a') : 'TBD'}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleToggleMatch(match.id, match.status === 'live')}
                  className={`p-2 rounded-lg text-xs font-black ${match.status === 'live' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}
                >
                  {match.status === 'live' ? <FaPause size={12} /> : <FaPlay size={12} />}
                </button>
                <button onClick={() => navigate(`/events/${eventId}/matches/${match.id}/edit`)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <FaEdit size={12} />
                </button>
                <button onClick={() => handleDelete(match.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white ml-auto"
                >
                  Del
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventMatches;
