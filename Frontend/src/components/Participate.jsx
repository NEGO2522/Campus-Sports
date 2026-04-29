import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser } from '../utils/auth';

const Participate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [participationType, setParticipationType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);
  const [userReg, setUserReg] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventData = await api.get(`/events/${id}`);
        setParticipationType(eventData.participation_type);

        // Check if the current user is already in the participants list
        const alreadyIn = (eventData.participants || []).some(
          p => p.id === currentUser?.id
        );
        setAlreadyParticipated(alreadyIn);
        setUserReg(currentUser?.registrationNumber || null);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleParticipate = async () => {
    if (!currentUser) {
      alert('You must be logged in to participate.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/events/${id}/join`);
      setAlreadyParticipated(true);
      setShowConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      alert(error?.error || 'Failed to participate.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const glassStyle = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '1.5rem',
    minWidth: '280px',
    maxWidth: '90vw',
  };

  if (participationType === 'player') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-0">
        <div style={glassStyle} className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6 text-center">
            Participate in Event
          </h2>
          <div className="flex justify-center">
            <button
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                alreadyParticipated
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-[#ccff00] text-black hover:bg-[#d9ff33]'
              }`}
              onClick={() => setShowConfirm(true)}
              disabled={saving || alreadyParticipated}
            >
              {alreadyParticipated ? 'Already Registered ✓' : 'Participate'}
            </button>
          </div>
        </div>

        {showConfirm && !alreadyParticipated && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
            <div className="bg-[#111] border border-white/10 p-6 sm:p-8 rounded-2xl w-full max-w-sm">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2 text-white">Confirm Participation</h3>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mb-6">
                You'll be registered for this event
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-[#ccff00] text-black font-black uppercase rounded-xl hover:bg-[#d9ff33] transition-all disabled:opacity-50"
                  onClick={handleParticipate}
                  disabled={saving}
                >
                  {saving ? 'Registering...' : 'Yes, Join'}
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase rounded-xl hover:bg-white/10 transition-all"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Team-based events
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-0">
      <div style={glassStyle} className="w-full sm:w-auto">
        <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter mb-6 text-center">
          Participate in Event
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
              alreadyParticipated
                ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                : 'bg-[#ccff00] text-black hover:bg-[#d9ff33]'
            }`}
            onClick={() => {
              if (!alreadyParticipated) navigate(`/events/${id}/create-team/`);
            }}
            disabled={alreadyParticipated}
          >
            {alreadyParticipated ? 'Registered ✓' : 'Create Team'}
          </button>
          <button
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
              alreadyParticipated
                ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                : 'bg-white/5 border border-white/10 text-white hover:border-[#ccff00]/50 hover:text-[#ccff00]'
            }`}
            onClick={() => !alreadyParticipated && navigate('/notification')}
            disabled={alreadyParticipated}
          >
            {alreadyParticipated ? 'Registered ✓' : 'See Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Participate;
