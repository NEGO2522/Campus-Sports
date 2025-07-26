import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [removingId, setRemovingId] = useState(null);

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
          <tr>
            <td className="py-3 px-4 font-semibold flex items-center"><FaInfoCircle className="mr-2 text-yellow-500" /> Sport</td>
            <td className="py-3 px-4">{event.sport}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div>
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
      </div>
    </div>
  );
};

export default EventDetail;
