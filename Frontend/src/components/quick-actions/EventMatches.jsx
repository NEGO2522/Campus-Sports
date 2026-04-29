import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';

// isCreator prop must be passed from parent (EventDetail) — only renders controls if true
const EventMatches = ({ eventId, isCreator }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [actionId, setActionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/events/${eventId}/matches`);
        setMatches(data);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchMatches();
  }, [eventId]);

  const handleToggleMatch = async (matchId, currentStatus) => {
    // Guard: only creator can do this
    if (!isCreator) return;
    const newStatus = currentStatus === 'live' ? 'scheduled' : 'live';
    try {
      setActionId(matchId);
      await api.put(`/events/${eventId}/matches/${matchId}`, { status: newStatus });
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: newStatus } : m));
      toast.success(newStatus === 'live' ? 'Match is LIVE!' : 'Match paused');
    } catch (err) {
      toast.error(err?.error || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (matchId) => {
    // Guard: only creator can do this
    if (!isCreator) return;
    if (!window.confirm('Delete this match? Cannot be undone.')) return;
    try {
      setActionId(matchId);
      await api.delete(`/events/${eventId}/matches/${matchId}`);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Match deleted');
    } catch (err) {
      toast.error(err?.error || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-[#ccff00]" /></div>;
  }

  if (!matches.length) {
    return (
      <div className="text-center text-gray-500 text-sm py-4 font-bold uppercase tracking-widest">
        No matches created yet
      </div>
    );
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
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl relative"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest">{match.round}</span>
                {match.status === 'live' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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

              {/* Action buttons — only visible to event creator */}
              {isCreator && (
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleToggleMatch(match.id, match.status)}
                    disabled={actionId === match.id}
                    className={`p-2 rounded-lg text-xs font-black transition-all ${
                      match.status === 'live'
                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/40'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/40'
                    }`}
                    title={match.status === 'live' ? 'Pause match' : 'Start match'}
                  >
                    {actionId === match.id ? <FaSpinner className="animate-spin" size={12} /> : match.status === 'live' ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>

                  <button
                    onClick={() => navigate(`/events/${eventId}/matches/${match.id}/edit`)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    title="Edit match"
                  >
                    <FaEdit size={12} />
                  </button>

                  <button
                    onClick={() => handleDelete(match.id)}
                    disabled={actionId === match.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-auto"
                    title="Delete match"
                  >
                    {actionId === match.id ? <FaSpinner className="animate-spin" size={12} /> : <Trash2 size={12} />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventMatches;
