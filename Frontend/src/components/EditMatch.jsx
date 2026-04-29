import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getUser } from '../utils/auth';

const EditMatch = () => {
  const { eventId, matchId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    round: '',
    team1Id: '',
    team2Id: '',
    location: '',
    date: '',
    time: '',
    team1Score: '',
    team2Score: '',
    status: 'scheduled',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event to verify creator
        const event = await api.get(`/events/${eventId}`);

        // Block non-creators immediately
        if (event.created_by !== currentUser?.id) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        setTeams(event.teams || []);

        // Fetch match list and find this match
        const matches = await api.get(`/events/${eventId}/matches`);
        const match = matches.find(m => m.id === matchId);

        if (match) {
          const d = match.match_date ? new Date(match.match_date) : null;
          setForm({
            round: match.round || '',
            team1Id: match.team1_id || '',
            team2Id: match.team2_id || '',
            location: match.location || '',
            date: d ? d.toISOString().slice(0, 10) : '',
            time: d ? d.toTimeString().slice(0, 5) : '',
            team1Score: match.team1_score ?? '',
            team2Score: match.team2_score ?? '',
            status: match.status || 'scheduled',
          });
        }
      } catch (err) {
        setError('Failed to load match data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, matchId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (forbidden) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/events/${eventId}/matches/${matchId}`, {
        round: form.round,
        team1Id: form.team1Id || null,
        team2Id: form.team2Id || null,
        location: form.location,
        matchDate: form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : null,
        team1Score: form.team1Score !== '' ? Number(form.team1Score) : null,
        team2Score: form.team2Score !== '' ? Number(form.team2Score) : null,
        status: form.status,
      });
      toast.success('Match updated!');
      navigate(-1);
    } catch (err) {
      setError(err?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Not the creator — show access denied
  if (forbidden) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 text-white px-4">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-4xl">
        🔒
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
          Only the event creator can edit matches
        </p>
      </div>
      <button
        onClick={() => navigate(`/events/${eventId}`)}
        className="bg-[#ccff00] text-black font-black italic uppercase px-6 py-3 rounded-xl hover:bg-[#d9ff33] transition-all text-xs tracking-widest"
      >
        Back to Event
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl transition-colors"
          onClick={() => navigate(-1)}
        >
          &times;
        </button>

        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8">
          Edit <span className="text-[#ccff00]">Match</span>
        </h2>

        {error && (
          <p className="text-red-500 text-xs font-bold uppercase mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Round */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Round Name</label>
            <input
              type="text" name="round" value={form.round} onChange={handleChange}
              placeholder="e.g. Quarter Final"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Location</label>
            <input
              type="text" name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Main Ground"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date</label>
              <input
                type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Time</label>
              <input
                type="time" name="time" value={form.time} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
              />
            </div>
          </div>

          {/* Teams */}
          {teams.length > 0 && ['team1Id', 'team2Id'].map((key, i) => (
            <div key={key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Team {i + 1}</label>
              <select
                name={key} value={form[key]} onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
              >
                <option value="" className="bg-[#111]">Select Team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#111]">{t.team_name || t.name}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            {['team1Score', 'team2Score'].map((key, i) => (
              <div key={key}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Team {i + 1} Score
                </label>
                <input
                  type="number" name={key} value={form[key]} onChange={handleChange}
                  min="0" placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-black focus:outline-none focus:border-[#ccff00] transition-all"
                />
              </div>
            ))}
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Match Status</label>
            <select
              name="status" value={form.status} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
            >
              <option value="scheduled" className="bg-[#111]">Scheduled</option>
              <option value="live" className="bg-[#111]">Live</option>
              <option value="completed" className="bg-[#111]">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#ccff00] text-black font-black italic uppercase py-4 rounded-xl hover:bg-[#e6ff80] transition-all mt-4 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMatch;
