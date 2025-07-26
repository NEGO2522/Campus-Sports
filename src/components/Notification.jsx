import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Link } from 'react-router-dom';

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
          const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
          teamSnap.forEach(inviteDoc => {
            const data = inviteDoc.data();
            if (data.invitee === user.uid && data.accepted === false) {
              allInvites.push({
                eventId,
                inviteId: inviteDoc.id,
                inviter: data.inviter,
                accepted: data.accepted,
                timestamp: data.timestamp,
              });
            }
          });
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

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (invites.length === 0) {
    return <div className="p-8 text-center text-gray-500">No invitations found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Invitations</h2>
      <ul className="space-y-4">
        {invites.map(invite => (
          <li key={invite.inviteId} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-800">You have been invited to join a team in event: <span className="font-bold">{invite.eventId}</span></div>
              <div className="text-xs text-gray-500 mt-1">Invited by: {invite.inviter}</div>
            </div>
            <Link to={`/events/${invite.eventId}/accept-invite/${invite.inviteId}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">View Invite</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
