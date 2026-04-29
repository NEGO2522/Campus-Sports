import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { UserPlus, X, Check, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const Notification = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [dismissingId, setDismissingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState({ open: false, inviteId: null });

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const data = await api.get('/invites/pending');
        setInvites(data);
      } catch (err) {
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, []);

  const handleAccept = async (inviteId) => {
    setAcceptingId(inviteId);
    try {
      await api.put(`/invites/${inviteId}/accept`);
      setInvites(prev => prev.filter(i => i.inviteId !== inviteId));
    } catch (err) {
      alert('Failed to accept invite.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDismiss = async () => {
    const { inviteId } = showConfirm;
    setDismissingId(inviteId);
    try {
      await api.delete(`/invites/${inviteId}`);
      setInvites(prev => prev.filter(i => i.inviteId !== inviteId));
    } catch (err) {
      alert('Failed to dismiss invitation.');
    } finally {
      setShowConfirm({ open: false, inviteId: null });
      setDismissingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Invitations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-10 px-4 sm:pt-28 sm:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Inbox<span className="text-[#ccff00]">.</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {invites.length} Pending Recruitment Requests
          </p>
        </header>

        {invites.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-[2rem] p-16 text-center">
            <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.4em]">No Active Invites Found</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {invites.map(invite => (
              <li key={invite.inviteId} className="group relative bg-[#111] border border-white/5 rounded-[1.5rem] p-6 hover:border-[#ccff00]/40 transition-all duration-300">
                <button
                  className="absolute top-5 right-5 text-gray-600 hover:text-red-500 transition-colors"
                  onClick={() => setShowConfirm({ open: true, inviteId: invite.inviteId })}
                >
                  <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ccff00]/10 rounded-xl flex items-center justify-center text-[#ccff00] flex-shrink-0">
                    <UserPlus size={24} />
                  </div>
                  <div className="flex-1 pr-6">
                    <p className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest mb-1">Incoming Invite</p>
                    <h3 className="text-lg font-bold leading-tight">
                      Join squad for <span className="italic underline underline-offset-4 decoration-white/20">{invite.eventName}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Team: {invite.teamName}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-bold text-gray-300 uppercase">{invite.inviterName}</span>
                      </div>
                      {invite.inviterEmail && (
                        <span className="text-[10px] text-gray-600 italic">{invite.inviterEmail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 py-4 bg-white text-black font-black italic uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-[#ccff00] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  onClick={() => handleAccept(invite.inviteId)}
                  disabled={acceptingId === invite.inviteId}
                >
                  {acceptingId === invite.inviteId
                    ? <Loader2 className="animate-spin" size={16} />
                    : <><Check size={16} strokeWidth={3} /> Accept Recruitment</>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showConfirm.open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Reject Request?</h3>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-8 leading-relaxed">
              This will permanently remove the invitation.
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                onClick={handleDismiss}
                disabled={dismissingId !== null}
              >
                {dismissingId ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Dismiss</>}
              </button>
              <button
                className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
                onClick={() => setShowConfirm({ open: false, inviteId: null })}
              >
                Keep Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;