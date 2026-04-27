import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const CreateTeam = () => {
  const [invited, setInvited] = useState([]); // This will now be fetched from Firestore
  const { id: eventId, reg: regNumberParam } = useParams();
  const [accessDenied, setAccessDenied] = useState(false);
  const [userReg, setUserReg] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUid(auth.currentUser.uid);
      // Fetch registration number of current user
      getDoc(doc(db, 'users', auth.currentUser.uid)).then(userDoc => {
        if (userDoc.exists()) {
          setUserReg(userDoc.data().registrationNumber);
        }
      });
    }
  }, []);

  // Restrict access to only the user with the registration number in the route
  useEffect(() => {
    if (!userReg || !regNumberParam) return;
    if (userReg !== regNumberParam) setAccessDenied(true);
    else setAccessDenied(false);
  }, [userReg, regNumberParam]);

  // Fetch invited students from Firestore (with accepted status), only those sent by current user
  useEffect(() => {
    const fetchInvited = async () => {
      if (!eventId || !currentUid) return;
      try {
        const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
        // Only show invites sent by the current user
        const invitedList = teamSnap.docs
          .filter(doc => doc.data().inviter === currentUid)
          .map(doc => ({ invitee: doc.data().invitee, accepted: doc.data().accepted }));
        setInvited(invitedList);
      } catch (err) {
        setInvited([]);
      }
    };
    fetchInvited();
  }, [eventId, currentUid]);

  // Track all members of all teams in the event
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  useEffect(() => {
    // Fetch team size and all team members and leaders from event
    const fetchEvent = async () => {
      setEventLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setTeamSize(eventDoc.data().teamSize || null);
          // Collect all members and leaders from all teams
          const teams = eventDoc.data().team || {};
          let membersAndLeaders = [];
          Object.values(teams).forEach(team => {
            if (Array.isArray(team.members)) {
              membersAndLeaders = membersAndLeaders.concat(team.members);
            }
            if (team.leader) {
              membersAndLeaders.push(team.leader);
            }
          });
          setAllTeamMembers(membersAndLeaders);
        }
      } catch (error) {
        setTeamSize(null);
        setAllTeamMembers([]);
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {/* Loading Bar */}
      {loading && (
        <div className="w-full h-1 bg-blue-100 fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-blue-600 animate-pulse" style={{ width: '50%' }}></div>
        </div>
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6 mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Create Team - Select Students</h2>
        <div className="mb-5 sm:mb-6">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Team Name</label>
          <input
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {eventLoading ? (
            <div className="text-gray-500 text-xs sm:text-sm mt-1">Loading team size...</div>
          ) : teamSize ? (
            <div className="text-blue-700 text-xs sm:text-sm font-medium mt-1">Team size for this event: <span className="font-bold">{teamSize} students</span></div>
          ) : (
            <div className="text-red-500 text-xs sm:text-sm mt-1">Team size not set for this event.</div>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Search Team Mates</label>
          <div className="relative">
            <div className="flex items-center relative">
              <FaSearch className="absolute left-3 text-gray-400 z-10 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search by name or registration number"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                autoComplete="off"
                onKeyDown={e => {
                  if (e.key === 'Escape') setSearch('');
                }}
              />
              {search.trim() !== '' && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none p-1"
                  onClick={() => setSearch('')}
                  tabIndex={0}
                  aria-label="Clear search"
                >
                  <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            {search.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-1 sm:mt-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl z-20 max-h-60 sm:max-h-80 overflow-y-auto transition-all">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No students found.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filtered.map(student => (
                      <li key={student.id} className="flex items-center py-2 sm:py-3 px-3 sm:px-4 hover:bg-blue-50 transition-all">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 sm:mr-4">
                          <FaUser className="text-blue-500 text-sm sm:text-lg" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm sm:text-base font-medium text-gray-900 truncate">{student.fullName}</div>
                          <div className="text-xs text-gray-500 truncate">Reg: {student.registrationNumber}</div>
                          <div className="text-xs text-gray-400 truncate">{student.courseName}</div>
                        </div>
                        <div className="ml-2 sm:ml-4 flex-shrink-0">
                          {invited.some(i => i.invitee === student.id) ? (
                            <button
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg shadow text-xs sm:text-sm font-semibold cursor-not-allowed opacity-80 whitespace-nowrap"
                              disabled
                            >
                              Invited
                            </button>
                          ) : allTeamMembers.includes(student.id) ? (
                            <button
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-400 text-white rounded-lg shadow text-xs sm:text-sm font-semibold cursor-not-allowed opacity-80 whitespace-nowrap"
                              disabled
                            >
                              In Team
                            </button>
                          ) : (
                            <button
                              className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition text-xs sm:text-sm font-semibold whitespace-nowrap ${!canInviteMore ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                  const invitedList = teamSnap.docs
                                    .filter(doc => doc.data().inviter === inviterId)
                                    .map(doc => ({ invitee: doc.data().invitee, accepted: doc.data().accepted }));
                                  setInvited(invitedList);
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
                                  <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                  </svg>
                                  <span className="text-xs sm:text-sm">Inviting...</span>
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
        <div className="mt-6 sm:mt-8 max-w-3xl mx-auto bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-2 sm:mb-3">Team Members ({acceptedCount}/{teamSize ? teamSize - 1 : '?'})</h3>
          <div className="space-y-2 sm:space-y-3">
            {students.filter(s => invited.some(i => i.invitee === s.id)).map(student => {
              const inviteInfo = invited.find(i => i.invitee === student.id);
              return (
                <div key={student.id} className="flex items-center bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-blue-100 w-full">
                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3">
                    <FaUser className="text-blue-500 text-sm sm:text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-blue-900 truncate">{student.fullName}</div>
                    <div className="text-xs text-blue-500 truncate">Reg: {student.registrationNumber}</div>
                  </div>
                  <div className="ml-2 sm:ml-4 flex-shrink-0 flex items-center gap-1 sm:gap-2">
                    <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-semibold ${inviteInfo && inviteInfo.accepted ? 'bg-blue-600' : 'bg-green-500'} text-white whitespace-nowrap`}>
                      {inviteInfo && inviteInfo.accepted ? 'Accepted' : 'Invited'}
                    </span>
                    <button
                      className="p-1.5 sm:p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition"
                      title="Remove"
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to remove this team member?')) return;
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
                            // Refresh invited list (only those sent by current user)
                            const newTeamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
                            const inviterId = auth.currentUser?.uid;
                            const invitedList = newTeamSnap.docs
                              .filter(docu => docu.data().inviter === inviterId)
                              .map(docu => ({ invitee: docu.data().invitee, accepted: docu.data().accepted }));
                            setInvited(invitedList);
                          }
                        } catch (err) {
                          alert('Failed to remove team member. Please try again.');
                        } finally {
                          setDeleteLoadingId(null);
                        }
                      }}
                      disabled={deleteLoadingId === student.id}
                    >
                      {deleteLoadingId === student.id ? (
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          className={`px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg text-base sm:text-lg font-bold transition-all transform hover:scale-105 active:scale-95 ${canSave ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          Save Team
        </button>
      </div>
      
      {/* Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Welcome, {teamName}!</h2>
            <p className="text-gray-600 mb-5 sm:mb-6">Your team has been created successfully!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition flex-1 max-w-xs"
                onClick={() => {
                  setShowOverlay(false);
                  navigate('/dashboard');
                }}
              >
                Back to Dashboard
              </button>
              <button
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-50 transition flex-1 max-w-xs"
                onClick={() => setShowOverlay(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTeam;
