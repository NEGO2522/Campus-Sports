import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { FaSearch, FaUser } from 'react-icons/fa';

const CreateTeam = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState(null);

  useEffect(() => {
    setCurrentUid(auth.currentUser ? auth.currentUser.uid : null);
  }, []);

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
        <div className="mb-6 flex items-center">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by name or registration number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No students found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filtered.map(student => (
              <li key={student.id} className="flex items-center py-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FaUser className="text-blue-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-medium text-gray-900">{student.fullName}</div>
                  <div className="text-sm text-gray-500">Reg. No: {student.registrationNumber}</div>
                  <div className="text-sm text-gray-400">{student.courseName}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CreateTeam;
