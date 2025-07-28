import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const CreateTeam = () => {
  const [invited, setInvited] = useState([]); // This will now be fetched from Firestore
  const { id: eventId } = useParams();
  const [accessDenied, setAccessDenied] = useState(false);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  useEffect(() => {
    setCurrentUid(auth.currentUser ? auth.currentUser.uid : null);
  }, []);

  // Restrict access to only the leader
  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user || !eventId) return;
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists() && eventSnap.data().team) {
        const teams = eventSnap.data().team;
        // Is user a leader of any team?
        const isLeader = Object.values(teams).some(team => team.leader === user.uid);
        // Is user a member (not leader) of any team?
        const isMemberNotLeader = Object.values(teams).some(team =>
          Array.isArray(team.members) && team.members.includes(user.uid) && team.leader !== user.uid
        );
        if (isMemberNotLeader) setAccessDenied(true);
        else setAccessDenied(false);
      } else {
        setAccessDenied(false);
      }
    };
    checkAccess();
  }, [eventId]);

  // Fetch invited students from Firestore (with accepted status)
  useEffect(() => {
    const fetchInvited = async () => {
      if (!eventId) return;
      try {
        const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
        // Store array of { invitee, accepted }
        const invitedList = teamSnap.docs.map(doc => ({ invitee: doc.data().invitee, accepted: doc.data().accepted }));
        setInvited(invitedList);
      } catch (err) {
        setInvited([]);
      }
    };
    fetchInvited();
  }, [eventId]);

  useEffect(() => {
    // Fetch team size from event
    const fetchEvent = async () => {
      setEventLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setTeamSize(eventDoc.data().teamSize || null);
        }
      } catch (error) {
        setTeamSize(null);
      } finally {
        setEventLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
        // Exclude current user
        const filteredUsers = currentUid ? users.filter(u => u.id !== currentUid) : users;
        setStudents(filteredUsers);
        setFiltered(filteredUsers);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUid !== null) fetchStudents();
  }, [currentUid]);

  useEffect(() => {
    if (!search) {
      setFiltered(students);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        students.filter(
          s =>
            (s.fullName && s.fullName.toLowerCase().includes(lower)) ||
            (s.registrationNumber && s.registrationNumber.toLowerCase().includes(lower))
        )
      );
    }
  }, [search, students]);

  // Count invited and accepted students (excluding leader)
  const invitedCount = invited.length;
  const acceptedCount = invited.filter(i => i.accepted).length;
  // Only allow inviting up to teamSize-1 (excluding leader)
  const canInviteMore = teamSize ? invitedCount < teamSize - 1 : true;
  const canSave = teamSize && acceptedCount === teamSize - 1;

  // Loading state for invite/delete actions
  const [inviteLoadingId, setInviteLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const navigate = useNavigate();

  // Save handler
  const handleSave = async () => {
    if (!canSave) return;
    // Validate teamName
    const invalidKey = /[.#$\[\]/]/.test(teamName);
    if (!teamName || invalidKey) {
      alert('Invalid or empty team name. Please use a valid name without . # $ [ ] /');
      return;
    }
    try {
      const leaderId = currentUid;
      const acceptedMembers = invited.filter(i => i.accepted).map(i => i.invitee);
      const eventRef = doc(db, 'events', eventId);
      // Fetch current event data to merge teams
      const eventSnap = await getDoc(eventRef);
      let existingTeams = {};
      if (eventSnap.exists() && eventSnap.data().team) {
        existingTeams = eventSnap.data().team;
      }
      const teamObj = {
        ...existingTeams,
        [teamName]: {
          leader: leaderId,
          members: acceptedMembers
        }
      };
      // Merge the team field into the event document
      await setDoc(eventRef, { team: teamObj }, { merge: true });
      setShowOverlay(true);
    } catch (err) {
      console.error('Failed to save team:', err);
      alert('Failed to save team. Please try again.');
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-700 mb-4">Only the team leader can edit this team.</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Loading Bar */}
      {loading && (
        <div className="w-full h-1 bg-blue-100">
          <div className="h-1 bg-blue-600 animate-pulse w-1/2" style={{ width: '50%' }}></div>
        </div>
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Team - Select Students</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
          <input
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          {eventLoading ? (
            <div className="text-gray-500 text-sm">Loading team size...</div>
          ) : teamSize ? (
            <div className="text-blue-700 text-sm font-medium mb-2">Team size for this event: <span className="font-bold">{teamSize} students</span></div>
          ) : (
            <div className="text-red-500 text-sm mb-2">Team size not set for this event.</div>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Team Mates</label>
          <div className="flex items-center relative">
            <FaSearch className="text-gray-400 mr-2 z-10" />
            <input
              type="text"
              placeholder="Search by name or registration number"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              autoComplete="off"
            />
            {search.trim() !== '' && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto transition-all">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No students found.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filtered.map(student => (
                      <li key={student.id} className="flex items-center py-3 px-4 hover:bg-blue-50 transition-all">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <FaUser className="text-blue-500 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-medium text-gray-900">{student.fullName}</div>
                          <div className="text-xs text-gray-500">Reg. No: {student.registrationNumber}</div>
                          <div className="text-xs text-gray-400">{student.courseName}</div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {invited.includes(student.id) ? (
                            <button
                              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow text-sm font-semibold cursor-not-allowed opacity-80"
                              disabled
                            >
                              Invited
                            </button>
                          ) : (
                            <button
                              className={`px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition text-sm font-semibold ${!canInviteMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={async () => {
                                if (!canInviteMore) return;
                                setInviteLoadingId(student.id);
                                try {
                                  const inviterId = auth.currentUser?.uid;
                                  if (!inviterId) return;
                                  await addDoc(collection(db, 'events', eventId, 'team'), {
                                    inviter: inviterId,
                                    invitee: student.id,
                                    accepted: false,
                                    timestamp: serverTimestamp()
                                  });
                                  // Refetch invited list after successful invite
                                  const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
                                  const invitedIds = teamSnap.docs.map(doc => doc.data().invitee);
                                  setInvited(invitedIds);
                                } catch (err) {
                                  // Optionally handle error
                                  console.error('Failed to send invite:', err);
                                } finally {
                                  setInviteLoadingId(null);
                                }
                              }}
                              disabled={!canInviteMore || inviteLoadingId === student.id}
                            >
                              {inviteLoadingId === student.id ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                  Inviting...
                                </span>
                              ) : (
                                'Invite'
                              )}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      {invited.length > 0 && (
        <div className="mt-8 max-w-3xl mx-auto bg-white rounded-xl shadow p-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="space-y-3">
            {students.filter(s => invited.some(i => i.invitee === s.id)).map(student => {
              const inviteInfo = invited.find(i => i.invitee === student.id);
              return (
                <div key={student.id} className="flex items-center bg-white rounded-lg shadow p-3 border border-blue-100 w-full">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaUser className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-blue-900">{student.fullName}</div>
                    <div className="text-xs text-blue-500">Reg. No: {student.registrationNumber}</div>
                    <div className="text-xs text-blue-400">{student.courseName}</div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                    <button
                      className={`px-4 py-2 rounded-lg shadow text-sm font-semibold cursor-not-allowed opacity-80 ${inviteInfo && inviteInfo.accepted ? 'bg-blue-600' : 'bg-green-500'} text-white`}
                      disabled
                    >
                      {inviteInfo && inviteInfo.accepted ? 'Accepted' : 'Invited'}
                    </button>
                    {/* Dustbin Button */}
                    <button
                      className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition"
                      title="Remove"
                      onClick={async () => {
                        setDeleteLoadingId(student.id);
                        try {
                          // Find invite doc id for this student
                          const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
                          const inviteDoc = teamSnap.docs.find(docu => docu.data().invitee === student.id);
                          if (inviteDoc) {
                            const inviteData = inviteDoc.data();
                            // If accepted, delete the whole team from event's team field
                            if (inviteData.accepted) {
                              // Remove the team from the event's team object
                              const eventRef = doc(db, 'events', eventId);
                              const eventSnap = await getDoc(eventRef);
                              if (eventSnap.exists() && eventSnap.data().team) {
                                let teams = { ...eventSnap.data().team };
                                // Find the team that contains this student as accepted
                                const teamNameToDelete = Object.keys(teams).find(teamName => {
                                  const team = teams[teamName];
                                  return Array.isArray(team.members) && team.members.includes(student.id);
                                });
                                if (teamNameToDelete) {
                                  delete teams[teamNameToDelete];
                                  await setDoc(eventRef, { team: teams }, { merge: true });
                                }
                              }
                            }
                            // Delete the invite doc
                            await deleteDoc(doc(db, 'events', eventId, 'team', inviteDoc.id));
                            // Refresh invited list
                            const newTeamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
                            const invitedList = newTeamSnap.docs.map(docu => ({ invitee: docu.data().invitee, accepted: docu.data().accepted }));
                            setInvited(invitedList);
                          }
                        } catch (err) {
                          alert('Failed to remove invite.');
                        } finally {
                          setDeleteLoadingId(null);
                        }
                      }}
                      disabled={deleteLoadingId === student.id}
                    >
                      {deleteLoadingId === student.id ? (
                        <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Save Button Fixed at Bottom Right */}
      <button
        className={`fixed bottom-8 right-8 px-8 py-4 rounded-full shadow-lg text-lg font-bold transition-all z-50 ${canSave ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        disabled={!canSave}
        onClick={handleSave}
      >
        Save
      </button>
      {/* Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome {teamName}</h2>
            <button
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
              onClick={() => {
                setShowOverlay(false);
                navigate('/dashboard');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTeam;
