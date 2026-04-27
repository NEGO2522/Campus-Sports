import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditMatch = () => {
  const { eventId, matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    round: '',
    team1: '',
    team2: '',
    location: '',
    date: '',
    time: '',
  });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchMatchAndTeams = async () => {
      setLoading(true);
      try {
        // Fetch event for teams
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        let teamList = [];
        if (eventSnap.exists() && eventSnap.data().team) {
          teamList = Object.keys(eventSnap.data().team);
        }
        setTeams(teamList);
        // Fetch match
        const matchRef = doc(db, 'events', eventId, 'matches', matchId);
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
          const data = matchSnap.data();
          let date = '', time = '';
          if (data.dateTime) {
            let dateObj;
            if (typeof data.dateTime.toDate === 'function') {
              dateObj = data.dateTime.toDate();
            } else {
              dateObj = new Date(data.dateTime);
            }
            if (!isNaN(dateObj.getTime())) {
              date = dateObj.toISOString().slice(0, 10);
              time = dateObj.toTimeString().slice(0, 5);
            }
          }
          setForm({
            round: data.round || '',
            team1: data.team1?.name || data.team1 || '',
            team2: data.team2?.name || data.team2 || '',
            location: data.location || '',
            date,
            time,
          });
        } else {
          setError('Match not found');
        }
      } catch (err) {
        setError('Failed to fetch match data');
      } finally {
        setLoading(false);
      }
    };
    fetchMatchAndTeams();
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
      const matchRef = doc(db, 'events', eventId, 'matches', matchId);
      const dateTime = new Date(`${form.date}T${form.time}`);
      await updateDoc(matchRef, {
        round: form.round,
        team1: form.team1,
        team2: form.team2,
        location: form.location,
        dateTime,
      });
      navigate(-1); // Go back to previous page
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={() => navigate(-1)}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Edit Match</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Round Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              name="round"
              value={form.round}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Team 1 Name</label>
            <select
              className="w-full border px-3 py-2 rounded"
              name="team1"
              value={form.team1}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Team 1</option>
              {teams.map(teamName => (
                <option key={teamName} value={teamName}>{teamName}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Team 2 Name</label>
            <select
              className="w-full border px-3 py-2 rounded"
              name="team2"
              value={form.team2}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Team 2</option>
              {teams.map(teamName => (
                <option key={teamName} value={teamName}>{teamName}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              className="w-full border px-3 py-2 rounded"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                className="w-full border px-3 py-2 rounded"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMatch;
