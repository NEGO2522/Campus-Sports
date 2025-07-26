import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { FaSearch, FaUser } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const CreateTeam = () => {
  const [invited, setInvited] = useState([]); // This will now be fetched from Firestore
  const { id: eventId } = useParams();
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

  // Fetch invited students from Firestore
  useEffect(() => {
    const fetchInvited = async () => {
      if (!eventId) return;
      try {
        const teamSnap = await getDocs(collection(db, 'events', eventId, 'team'));
        const invitedIds = teamSnap.docs.map(doc => doc.data().invitee);
        setInvited(invitedIds);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition text-sm font-semibold"
                              onClick={async () => {
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
                                }
                              }}
                            >
                              Invite
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
            {students.filter(s => invited.includes(s.id)).map(student => (
              <div key={student.id} className="flex items-center bg-white rounded-lg shadow p-3 border border-blue-100 w-full">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaUser className="text-blue-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-blue-900">{student.fullName}</div>
                  <div className="text-xs text-blue-500">Reg. No: {student.registrationNumber}</div>
                  <div className="text-xs text-blue-400">{student.courseName}</div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow text-sm font-semibold cursor-not-allowed opacity-80"
                    disabled
                  >
                    Invited
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CreateTeam;
