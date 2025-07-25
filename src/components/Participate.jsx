import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const Participate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participationType, setParticipationType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (eventDoc.exists()) {
          setParticipationType(eventDoc.data().participationType);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleParticipate = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to participate.');
        return;
      }
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      });
      setShowConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to participate.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (participationType === 'player') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Participate in Event</h2>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowConfirm(true)}
          disabled={saving}
        >
          Participate
        </button>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Are you sure?</h3>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleParticipate}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Yes'}
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For team-based events
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Participate in Event</h2>
      <div className="space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => navigate(`/events/${id}/create-team`)}
        >
          Create Team
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          onClick={() => navigate(`/events/${id}/join-team`)}
        >
          Join Team
        </button>
      </div>
    </div>
  );
};

export default Participate;
