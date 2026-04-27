import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// No Firebase. TODO: connect to backend API
// import api from '../utils/api';

const EditMatch = () => {
  const { eventId, matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    round: '', team1: '', team2: '', location: '', date: '', time: '',
  });

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      try {
        // TODO:
        // const event = await api.get(`/events/${eventId}`);
        // setTeams(event.teams.map(t => t.name));
        // const match = await api.get(`/events/${eventId}/matches/${matchId}`);
        // const d = new Date(match.match_date);
        // setForm({
        //   round: match.round || '',
        //   team1: match.team1_name || '',
        //   team2: match.team2_name || '',
        //   location: match.location || '',
        //   date: d.toISOString().slice(0, 10),
        //   time: d.toTimeString().slice(0, 5),
        // });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch match');
        setLoading(false);
      }
    };
    fetchMatch();
  }, [eventId, matchId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // TODO:
      // await api.put(`/events/${eventId}/matches/${matchId}`, {
      //   round: form.round,
      //   team1Name: form.team1,
      //   team2Name: form.team2,
      //   location: form.location,
      //   matchDate: new Date(`${form.date}T${form.time}`),
      // });
      navigate(-1);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl" onClick={() => navigate(-1)}>
          &times;
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8">
          Edit <span className="text-[#ccff00]">Match</span>
        </h2>

        {error && <p className="text-red-500 text-xs font-bold uppercase mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Round Name', name: 'round', type: 'text' },
            { label: 'Location', name: 'location', type: 'text' },
            { label: 'Date', name: 'date', type: 'date' },
            { label: 'Time', name: 'time', type: 'time' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
                required
              />
            </div>
          ))}

          {['team1', 'team2'].map((key, i) => (
            <div key={key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Team {i + 1}</label>
              <select
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-all"
                required
              >
                <option value="" className="bg-[#111]">Select Team</option>
                {teams.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
              </select>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#ccff00] text-black font-black italic uppercase py-4 rounded-xl hover:bg-[#e6ff80] transition-all mt-4"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMatch;
