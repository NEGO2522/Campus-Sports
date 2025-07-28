import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const Participate = () => {
  const { id } = useParams();
  const [userReg, setUserReg] = useState(null);
  const navigate = useNavigate();
  const [participationType, setParticipationType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (eventDoc.exists()) {
          setParticipationType(eventDoc.data().participationType);
          const user = auth.currentUser;
          if (user) {
            // Get registration number
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUserReg(userDoc.data().registrationNumber);
            }
            // Check for individual participation
            const participants = eventDoc.data().participants || [];
            if (participants.includes(user.uid)) {
              setAlreadyParticipated(true);
            } else {
              // Check for team participation
              const teamObj = eventDoc.data().team || {};
              let found = false;
              Object.values(teamObj).forEach(team => {
                if (Array.isArray(team.members) && team.members.includes(user.uid)) {
                  found = true;
                }
              });
              setAlreadyParticipated(found);
            }
          }
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
          className={`px-6 py-3 rounded-lg shadow transition font-semibold text-white ${alreadyParticipated ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={() => setShowConfirm(true)}
          disabled={saving || alreadyParticipated}
        >
          {alreadyParticipated ? 'Participated' : 'Participate'}
        </button>
        {showConfirm && !alreadyParticipated && (
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
          className={`px-6 py-3 rounded-lg shadow font-semibold text-white ${alreadyParticipated ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={() => {
            if (!alreadyParticipated && userReg) {
              navigate(`/events/${id}/create-team/${userReg}`);
            }
          }}
          disabled={alreadyParticipated}
        >
          {alreadyParticipated ? 'Participated' : 'Create Team'}
        </button>
        <button
          className={`px-6 py-3 rounded-lg shadow font-semibold text-white ${alreadyParticipated ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          onClick={() => !alreadyParticipated && navigate('/notification')}
          disabled={alreadyParticipated}
        >
          {alreadyParticipated ? 'Participated' : 'See Invitation'}
        </button>
      </div>
    </div>
  );
};

export default Participate;
