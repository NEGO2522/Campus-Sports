import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
// import { Link } from 'react-router-dom';

const Notification = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Search all events for invites to this user
        const eventsSnap = await getDocs(collection(db, 'events'));
        let allInvites = [];
        for (const eventDoc of eventsSnap.docs) {
          const eventId = eventDoc.id;
          const eventData = eventDoc.data();
          // Support both 'name' and 'eventName' fields
          const eventName = eventData.name || eventData.eventName || 'Unknown Event';
          const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
          for (const inviteDoc of teamSnap.docs) {
            const data = inviteDoc.data();
            if (data.invitee === user.uid && data.accepted === false) {
              // Fetch inviter's user info
              let inviterName = '';
              let inviterEmail = '';
              try {
                const inviterDoc = await getDoc(doc(db, 'users', data.inviter));
                if (inviterDoc.exists()) {
                  const inviterData = inviterDoc.data();
                  inviterName = inviterData.fullName || 'Unknown User';
                  inviterEmail = inviterData.email || '';
                } else {
                  inviterName = 'Unknown User';
                }
              } catch (e) {
                inviterName = 'Unknown User';
              }
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

  const [acceptingId, setAcceptingId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen sm:min-h-0">
        <div className="w-full h-1 bg-blue-100">
          <div className="h-1 bg-blue-600 animate-pulse w-1/2"></div>
        </div>
        <div className="p-4 sm:p-8 text-center">Loading...</div>
      </div>
    );
  }

  if (invites.length === 0) {
    return <div className="p-4 sm:p-8 text-center text-gray-500">No invitations found.</div>;
  }

  // Accept invite handler
  const handleAccept = async (eventId, inviteId) => {
    setAcceptingId(inviteId);
    try {
      await updateDoc(doc(db, 'events', eventId, 'team', inviteId), { accepted: true });
      // Remove the invite from the UI
      setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
    } catch (err) {
      alert('Failed to accept invite. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Invitations</h2>
      <ul className="space-y-3 sm:space-y-4">
        {invites.map(invite => (
          <li key={invite.inviteId} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium sm:font-semibold text-sm sm:text-base text-blue-800">
                You have been invited to join a team in event: <span className="font-bold break-words">{invite.eventName}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                Invited by: <span className="font-medium sm:font-semibold">{invite.inviterName}</span>
                {invite.inviterEmail && (
                  <span className="ml-1 sm:ml-2 text-gray-400 hidden sm:inline">({invite.inviterEmail})</span>
                )}
              </div>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center min-w-[100px] sm:min-w-[80px] text-sm sm:text-base"
              onClick={() => handleAccept(invite.eventId, invite.inviteId)}
              disabled={acceptingId === invite.inviteId}
            >
              {acceptingId === invite.inviteId ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  <span className="text-sm sm:text-base">Accepting...</span>
                </span>
              ) : (
                'Accept'
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
