import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { UserPlus, X, Check, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const Notification = () => {
  const [dismissingId, setDismissingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState({ open: false, inviteId: null, eventId: null });
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setInvites([]);
          setLoading(false);
          return;
        }
        const eventsSnap = await getDocs(collection(db, 'events'));
        let allInvites = [];
        for (const eventDoc of eventsSnap.docs) {
          const eventId = eventDoc.id;
          const eventData = eventDoc.data();
          const eventName = eventData.name || eventData.eventName || 'Unknown Event';
          const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
          for (const inviteDoc of teamSnap.docs) {
            const data = inviteDoc.data();
            if (data.invitee === user.uid && data.accepted === false) {
              let inviterName = 'Unknown User';
              let inviterEmail = '';
              try {
                const inviterDoc = await getDoc(doc(db, 'users', data.inviter));
                if (inviterDoc.exists()) {
                  const inviterData = inviterDoc.data();
                  inviterName = inviterData.fullName || 'Unknown User';
                  inviterEmail = inviterData.email || '';
                }
              } catch (e) { console.error(e); }
              
              allInvites.push({
                eventId,
                eventName,
                inviteId: inviteDoc.id,
                inviter: data.inviter,
                inviterName,
                inviterEmail,
                accepted: data.accepted,
                timestamp: data.timestamp,
              });
            }
          }
        }
        setInvites(allInvites);
      } catch (err) {
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, []);

  const handleAccept = async (eventId, inviteId) => {
    setAcceptingId(inviteId);
    try {
      await updateDoc(doc(db, 'events', eventId, 'team', inviteId), { accepted: true });
      setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
    } catch (err) {
      alert('Failed to accept invite.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDismiss = async () => {
    setDismissingId(showConfirm.inviteId);
    try {
      await deleteDoc(doc(db, 'events', showConfirm.eventId, 'team', showConfirm.inviteId));
      setInvites(prev => prev.filter(i => i.inviteId !== showConfirm.inviteId));
    } catch (err) {
      alert('Failed to dismiss invitation.');
    } finally {
      setShowConfirm({ open: false, inviteId: null, eventId: null });
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
        {/* Header - Icon Removed */}
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
              <li key={invite.inviteId} className="group relative bg-[#111] border border-white/5 rounded-[1.5rem] p-6 hover:border-[#ccff00]/40 transition-all duration-300 overflow-hidden">
                <button
                  className="absolute top-5 right-5 text-gray-600 hover:text-red-500 transition-colors"
                  onClick={() => setShowConfirm({ open: true, inviteId: invite.inviteId, eventId: invite.eventId })}
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
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[11px] font-bold text-gray-300 uppercase leading-none">{invite.inviterName}</span>
                      </div>
                      {invite.inviterEmail && (
                        <span className="text-[10px] text-gray-600 font-medium lowercase italic">{invite.inviterEmail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 py-4 bg-white text-black font-black italic uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-[#ccff00] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  onClick={() => handleAccept(invite.eventId, invite.inviteId)}
                  disabled={acceptingId === invite.inviteId}
                >
                  {acceptingId === invite.inviteId ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <><Check size={16} strokeWidth={3} /> Accept Recruitment</>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showConfirm.open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
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
                onClick={() => setShowConfirm({ open: false, inviteId: null, eventId: null })}
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