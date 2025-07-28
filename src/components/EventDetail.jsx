import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Create Match Modal State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState({
    round: '',
    team1: '',
    team2: '',
    location: '',
    date: '',
    time: ''
  });
  const [savingMatch, setSavingMatch] = useState(false);

  const fetchEventAndParticipants = async () => {
    setLoading(true);
    try {
      const eventDoc = await getDoc(doc(db, 'events', id));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEvent(eventData);
        if (Array.isArray(eventData.participants) && eventData.participants.length > 0) {
          // Fetch all users and filter by participant IDs
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const users = [];
          usersSnapshot.forEach(userDoc => {
            if (eventData.participants.includes(userDoc.id)) {
              users.push({ id: userDoc.id, ...userDoc.data() });
            }
          });
          setParticipants(users);
        } else {
          setParticipants([]);
        }
      }
    } catch (error) {
      console.error('Error fetching event or participants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndParticipants();
  }, [id]);

  const handleEdit = (field) => {
    setEditField(field);
    if (field === 'dateTime') {
      // Convert to yyyy-MM-ddTHH:mm for datetime-local input
      let dt = event.dateTime?.toDate ? event.dateTime.toDate() : new Date(event.dateTime);
      const pad = n => n.toString().padStart(2, '0');
      const formatted = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      setEditValue(formatted);
    } else {
      setEditValue(event[field] || '');
    }
  };

  const handleSave = async (field) => {
    setSavingField(true);
    try {
      let value = editValue;
      if (field === 'dateTime') {
        // Convert from yyyy-MM-ddTHH:mm to JS Date
        value = new Date(editValue);
      }
      await updateDoc(doc(db, 'events', id), { [field]: value });
      setEvent(prev => ({ ...prev, [field]: value }));
      setEditField(null);
    } catch (error) {
      alert('Failed to update.');
      console.error(error);
    } finally {
      setSavingField(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    setRemovingId(userId);
    try {
      await updateDoc(doc(db, 'events', id), {
        participants: arrayRemove(userId)
      });
      setParticipants(prev => prev.filter(p => p.id !== userId));
    } catch (error) {
      alert('Failed to remove participant.');
      console.error(error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center text-gray-500 py-8">Event not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{event.eventName}</h2>
      {/* Create Matches Button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => setShowMatchModal(true)}
          disabled={!event.team || Object.keys(event.team).length < 2}
        >
          Create Matches
        </button>
      </div>
      {/* Create Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowMatchModal(false)}
            >
              &times;
            </button>
            {(!event.team || Object.keys(event.team).length < 2) ? (
              <div className="text-center text-red-600 font-semibold">At least 2 teams are required to create a match.</div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 text-center">Create Match</h3>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setSavingMatch(true);
                    try {
                      const dateTime = new Date(`${matchForm.date}T${matchForm.time}`);
                      await addDoc(collection(db, 'events', id, 'matches'), {
                        round: matchForm.round,
                        team1: matchForm.team1,
                        team2: matchForm.team2,
                        location: matchForm.location,
                        dateTime
                      });
                      setShowMatchModal(false);
                      setMatchForm({ round: '', team1: '', team2: '', location: '', date: '', time: '' });
                      alert('Match created!');
                    } catch (err) {
                      alert('Failed to create match.');
                    } finally {
                      setSavingMatch(false);
                    }
                  }}
                >
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Round Name</label>
                    <input
                      className="w-full border px-3 py-2 rounded"
                      value={matchForm.round}
                      onChange={e => setMatchForm(f => ({ ...f, round: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Team 1 Name</label>
                    <select
                      className="w-full border px-3 py-2 rounded"
                      value={matchForm.team1}
                      onChange={e => setMatchForm(f => ({ ...f, team1: e.target.value }))}
                      required
                    >
                      <option value="" disabled>Select Team 1</option>
                      {event.team && Object.keys(event.team).map(teamName => (
                        <option key={teamName} value={teamName}>{teamName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Team 2 Name</label>
                    <select
                      className="w-full border px-3 py-2 rounded"
                      value={matchForm.team2}
                      onChange={e => setMatchForm(f => ({ ...f, team2: e.target.value }))}
                      required
                    >
                      <option value="" disabled>Select Team 2</option>
                      {event.team && Object.keys(event.team).map(teamName => (
                        <option key={teamName} value={teamName}>{teamName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      className="w-full border px-3 py-2 rounded"
                      value={matchForm.location}
                      onChange={e => setMatchForm(f => ({ ...f, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3 flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full border px-3 py-2 rounded"
                        value={matchForm.date}
                        onChange={e => setMatchForm(f => ({ ...f, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <input
                        type="time"
                        className="w-full border px-3 py-2 rounded"
                        value={matchForm.time}
                        onChange={e => setMatchForm(f => ({ ...f, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    disabled={savingMatch}
                  >
                    {savingMatch ? 'Saving...' : 'Save Match'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      <table className="w-full mb-8 border rounded-lg overflow-hidden">
        <tbody>
          <tr className="border-b">
            <td className="py-3 px-4 font-semibold flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" /> Date</td>
            <td className="py-3 px-4">
              {editField === 'dateTime' ? (
                <input
                  type="datetime-local"
                  className="border px-2 py-1 rounded w-full"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  disabled={savingField}
                />
              ) : (
                event.dateTime?.toDate ? event.dateTime.toDate().toLocaleString() : new Date(event.dateTime).toLocaleString()
              )}
            </td>
            <td className="py-3 px-4 w-12">
              {editField === 'dateTime' ? (
                <button className="text-blue-600 font-bold mr-2" onClick={() => handleSave('dateTime')} disabled={savingField}>Save</button>
              ) : (
                <button className="text-gray-500 hover:text-blue-600" onClick={() => handleEdit('dateTime')}><FaEdit /></button>
              )}
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-3 px-4 font-semibold flex items-center"><FaMapMarkerAlt className="mr-2 text-green-500" /> Location</td>
            <td className="py-3 px-4">
              {editField === 'location' ? (
                <input
                  className="border px-2 py-1 rounded w-full"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  disabled={savingField}
                />
              ) : (
                event.location
              )}
            </td>
            <td className="py-3 px-4 w-12">
              {editField === 'location' ? (
                <button className="text-blue-600 font-bold mr-2" onClick={() => handleSave('location')} disabled={savingField}>Save</button>
              ) : (
                <button className="text-gray-500 hover:text-blue-600" onClick={() => handleEdit('location')}><FaEdit /></button>
              )}
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-3 px-4 font-semibold flex items-center"><FaInfoCircle className="mr-2 text-yellow-500" /> Description</td>
            <td className="py-3 px-4">
              {editField === 'description' ? (
                <textarea
                  className="border px-2 py-1 rounded w-full"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  disabled={savingField}
                />
              ) : (
                event.description || 'No description provided.'
              )}
            </td>
            <td className="py-3 px-4 w-12">
              {editField === 'description' ? (
                <button className="text-blue-600 font-bold mr-2" onClick={() => handleSave('description')} disabled={savingField}>Save</button>
              ) : (
                <button className="text-gray-500 hover:text-blue-600" onClick={() => handleEdit('description')}><FaEdit /></button>
              )}
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-3 px-4 font-semibold flex items-center"><FaUsers className="mr-2 text-purple-500" /> Type</td>
            <td className="py-3 px-4 capitalize">{event.participationType}</td>
            <td></td>
          </tr>
          {event.participationType === 'team' && (
            <tr className="border-b">
              <td className="py-3 px-4 font-semibold flex items-center">👥 Team Size</td>
              <td className="py-3 px-4">
                {editField === 'teamSize' ? (
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="border px-2 py-1 rounded w-full"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    disabled={savingField}
                  />
                ) : (
                  event.teamSize || 'Not set'
                )}
              </td>
              <td className="py-3 px-4 w-12">
                {editField === 'teamSize' ? (
                  <button className="text-blue-600 font-bold mr-2" onClick={() => handleSave('teamSize')} disabled={savingField}>Save</button>
                ) : (
                  <button className="text-gray-500 hover:text-blue-600" onClick={() => handleEdit('teamSize')}><FaEdit /></button>
                )}
              </td>
            </tr>
          )}
          <tr>
            <td className="py-3 px-4 font-semibold flex items-center"><FaInfoCircle className="mr-2 text-yellow-500" /> Sport</td>
            <td className="py-3 px-4">{event.sport}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    {/* Team List for Team Events */}
      {event.participationType === 'team' && event.team && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Teams ({Object.keys(event.team).length}/{event.teamsNeeded || 0})
          </h3>
          <ul className="list-disc ml-6 text-blue-800">
            {Object.keys(event.team).map(teamName => (
              <li key={teamName} className="mb-1 font-medium flex items-center justify-between">
                <span>{teamName}</span>
                <button
                  className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition"
                  title="Delete Team"
                  disabled={deletingTeam === teamName}
                  onClick={async () => {
                    setDeletingTeam(teamName);
                    try {
                      const eventRef = doc(db, 'events', id);
                      const eventSnap = await getDoc(eventRef);
                      if (eventSnap.exists() && eventSnap.data().team) {
                        let teams = { ...eventSnap.data().team };
                        delete teams[teamName];
                        await updateDoc(eventRef, { team: teams });
                        // Refresh event data
                        const updatedSnap = await getDoc(eventRef);
                        if (updatedSnap.exists()) setEvent(updatedSnap.data());
                      }
                    } catch (err) {
                      alert('Failed to delete team.');
                    } finally {
                      setDeletingTeam(null);
                    }
                  }}
                >
                  {deletingTeam === teamName ? (
                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" /></svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        {event.participationType !== 'team' ? (
          <>
            <h3 className="text-xl font-semibold mb-2">
              Participants ({participants.length}/{event.teamsNeeded || event.playersNeeded || 0})
            </h3>
            {participants.length === 0 ? (
              <div className="text-gray-500">No students have participated yet.</div>
            ) : (
              <ul className="mb-4 ml-4 list-disc text-blue-800">
                {participants.map(student => (
                  <li key={student.id} className="mb-1 font-medium">{student.fullName}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-2">Participants ({participants.length})</h3>
            {participants.length === 0 ? (
              <div className="text-gray-500">No students have participated yet.</div>
            ) : (
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Reg. No</th>
                    <th className="py-2 px-4 text-left">Course</th>
                    <th className="py-2 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="py-2 px-4">{student.fullName}</td>
                      <td className="py-2 px-4">{student.registrationNumber}</td>
                      <td className="py-2 px-4">{student.courseName}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveParticipant(student.id)}
                          disabled={removingId === student.id}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
