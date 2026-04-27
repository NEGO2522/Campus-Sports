import React, { useEffect, useState } from 'react';
const TeamDetailOverlayLazy = React.lazy(() => import('./TeamDetailOverlay'));
import EventMatches from './quick-actions/EventMatches';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, 
  FaEdit, FaTrash, FaPlus, FaTrophy, FaChevronRight, FaTimes 
} from 'react-icons/fa';

const EventDetail = () => {
  const [showTeamOverlay, setShowTeamOverlay] = useState(false);
  const [teamDetail, setTeamDetail] = useState({ teamName: '', leader: null, members: [] });
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Match Modal State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState({ round: '', team1: '', team2: '', location: '', date: '', time: '' });
  const [savingMatch, setSavingMatch] = useState(false);

  const fetchEventAndParticipants = async () => {
    setLoading(true);
    try {
      const eventDoc = await getDoc(doc(db, 'events', id));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEvent(eventData);
        if (Array.isArray(eventData.participants) && eventData.participants.length > 0) {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const users = [];
          usersSnapshot.forEach(userDoc => {
            if (eventData.participants.includes(userDoc.id)) {
              users.push({ id: userDoc.id, ...userDoc.data() });
            }
          });
          setParticipants(users);
        } else {
          setParticipants([]);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEventAndParticipants(); }, [id]);

  const handleEdit = (field) => {
    setEditField(field);
    if (field === 'dateTime') {
      let dt = event.dateTime?.toDate ? event.dateTime.toDate() : new Date(event.dateTime);
      const pad = n => n.toString().padStart(2, '0');
      setEditValue(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    } else {
      setEditValue(event[field] || '');
    }
  };

  const handleSave = async (field) => {
    setSavingField(true);
    try {
      let value = field === 'dateTime' ? new Date(editValue) : editValue;
      await updateDoc(doc(db, 'events', id), { [field]: value });
      setEvent(prev => ({ ...prev, [field]: value }));
      setEditField(null);
    } catch (err) { alert('UPDATE FAILED'); } 
    finally { setSavingField(false); }
  };

  const handleRemoveParticipant = async (userId) => {
    if (!window.confirm("ELIMINATE PARTICIPANT FROM EVENT?")) return;
    setRemovingId(userId);
    try {
      await updateDoc(doc(db, 'events', id), { participants: arrayRemove(userId) });
      setParticipants(prev => prev.filter(p => p.id !== userId));
    } catch (err) { alert('REMOVAL FAILED'); } 
    finally { setRemovingId(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!event) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">EVENT_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-[#111] border border-white/10 rounded-sm p-6 md:p-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/5 pb-8">
            <div>
              <span className="text-[#ccff00] text-xs font-black tracking-widest uppercase mb-2 block">Event Operations</span>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase italic tracking-tighter leading-none">
                {event.eventName}
              </h1>
            </div>
            <button
              onClick={() => setShowMatchModal(true)}
              disabled={!event.team || Object.keys(event.team).length < 2}
              className="flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-black uppercase italic text-sm hover:bg-[#e6ff80] transition-all disabled:opacity-20"
            >
              <FaPlus /> Create Match
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 mb-12">
            {[
              { id: 'dateTime', icon: <FaCalendarAlt className="text-[#ccff00]" />, label: 'TIMESTAMP', value: event.dateTime?.toDate ? event.dateTime.toDate().toLocaleString() : new Date(event.dateTime).toLocaleString(), type: 'datetime-local' },
              { id: 'location', icon: <FaMapMarkerAlt className="text-[#ccff00]" />, label: 'COORDINATES', value: event.location },
              { id: 'description', icon: <FaInfoCircle className="text-[#ccff00]" />, label: 'MISSION BRIEF', value: event.description || 'N/A' },
              { id: 'sport', icon: <FaTrophy className="text-[#ccff00]" />, label: 'DISCIPLINE', value: event.sport },
              { id: 'participationType', icon: <FaUsers className="text-[#ccff00]" />, label: 'ENGAGEMENT', value: event.participationType, readonly: true },
              { id: 'teamSize', icon: <span className="text-[#ccff00] font-bold">#</span>, label: 'SQUAD SIZE', value: event.teamSize || '1', hidden: event.participationType !== 'team' }
            ].map((item) => !item.hidden && (
              <div key={item.id} className="bg-[#111] p-5 flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="mt-1">{item.icon}</div>
                  <div className="w-full">
                    <p className="text-[10px] text-white/40 font-black tracking-widest">{item.label}</p>
                    {editField === item.id ? (
                      <div className="mt-2 flex gap-2">
                        {item.id === 'description' ? (
                          <textarea className="bg-black border border-[#ccff00] text-white p-2 text-sm w-full outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        ) : (
                          <input type={item.type || 'text'} className="bg-black border border-[#ccff00] text-white p-2 text-sm w-full outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        )}
                        <button onClick={() => handleSave(item.id)} className="text-[#ccff00] font-bold text-xs uppercase underline">Save</button>
                      </div>
                    ) : (
                      <p className="text-lg font-bold uppercase tracking-tight break-all">{item.value}</p>
                    )}
                  </div>
                </div>
                {!item.readonly && editField !== item.id && (
                  <button onClick={() => handleEdit(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-[#ccff00]">
                    <FaEdit />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Participant / Team Section */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 mb-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Manifest</h3>
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-[#ccff00] font-mono text-sm">[{participants.length} ASSETS]</span>
             </div>

             {event.participationType === 'team' && event.team ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {Object.keys(event.team).map(teamName => (
                   <div key={teamName} className="border border-white/10 p-4 flex justify-between items-center hover:border-[#ccff00]/50 transition-colors">
                     <div 
                        className="cursor-pointer group flex items-center gap-3"
                        onClick={async () => {
                          const teamObj = event.team[teamName];
                          let leader = null; let members = [];
                          const leaderSnap = await getDoc(doc(db, 'users', teamObj.leader));
                          if (leaderSnap.exists()) leader = { id: teamObj.leader, ...leaderSnap.data() };
                          const membersSnap = await getDocs(collection(db, 'users'));
                          membersSnap.forEach(d => { if(teamObj.members.includes(d.id)) members.push({id: d.id, ...d.data()}); });
                          setTeamDetail({ teamName, leader, members });
                          setShowTeamOverlay(true);
                        }}
                      >
                       <div className="w-2 h-2 bg-[#ccff00]"></div>
                       <span className="font-bold uppercase tracking-wider group-hover:text-[#ccff00]">{teamName}</span>
                       <FaChevronRight className="text-[10px] text-white/20 group-hover:translate-x-1 transition-transform" />
                     </div>
                     <button 
                        onClick={async () => {
                          if(!window.confirm("ERASE SQUAD?")) return;
                          setDeletingTeam(teamName);
                          let teams = { ...event.team }; delete teams[teamName];
                          await updateDoc(doc(db, 'events', id), { team: teams });
                          setEvent(prev => ({...prev, team: teams}));
                          setDeletingTeam(null);
                        }}
                        className="text-white/20 hover:text-red-500 transition-colors"
                     >
                       {deletingTeam === teamName ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <FaTrash />}
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-white/10 text-[10px] text-white/40 tracking-[0.3em] uppercase">
                       <th className="pb-4 font-black px-2">Operator</th>
                       <th className="pb-4 font-black">ID_TAG</th>
                       <th className="pb-4 font-black text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm font-bold uppercase tracking-widest">
                     {participants.map(student => (
                       <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                         <td className="py-4 px-2">{student.fullName}</td>
                         <td className="py-4 text-white/60">{student.registrationNumber}</td>
                         <td className="py-4 text-right">
                           <button onClick={() => handleRemoveParticipant(student.id)} className="text-white/20 hover:text-red-500">
                             {removingId === student.id ? '...' : <FaTrash />}
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>

        {/* Match Control Panel (Sidebar) */}
        <div className="lg:w-96 w-full flex flex-col gap-6">
          <div className="bg-[#111] border border-white/10 p-6 rounded-sm">
            <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#ccff00]"></span> Live Matches
            </h3>
            <EventMatches eventId={id} />
          </div>
        </div>

      </div>

      {/* Brutalist Match Modal */}
      <AnimatePresence>
        {showMatchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border-2 border-[#ccff00] w-full max-w-md p-8 relative overflow-hidden"
            >
              <button onClick={() => setShowMatchModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-[#ccff00] text-xl">
                <FaTimes />
              </button>
              
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8">INIT_MATCH</h3>
              
              <form onSubmit={async e => {
                e.preventDefault(); setSavingMatch(true);
                try {
                  const dateTime = new Date(`${matchForm.date}T${matchForm.time}`);
                  await addDoc(collection(db, 'events', id, 'matches'), { ...matchForm, dateTime, matchStarted: false });
                  setShowMatchModal(false);
                } catch (err) { alert('SYS_ERROR'); } finally { setSavingMatch(false); }
              }} className="space-y-5">
                {[
                  { label: 'ROUND NAME', field: 'round', type: 'text', placeholder: 'e.g. SEMI_FINALS' },
                  { label: 'TEAM 01', field: 'team1', type: 'select', options: Object.keys(event.team || {}) },
                  { label: 'TEAM 02', field: 'team2', type: 'select', options: Object.keys(event.team || {}) },
                  { label: 'ARENA', field: 'location', type: 'text' },
                  { label: 'DATE', field: 'date', type: 'date' },
                  { label: 'TIME', field: 'time', type: 'time' }
                ].map((input) => (
                  <div key={input.field}>
                    <label className="text-[10px] font-black tracking-widest text-white/40 block mb-2">{input.label}</label>
                    {input.type === 'select' ? (
                      <select className="w-full bg-black border border-white/10 p-3 text-white font-bold outline-none focus:border-[#ccff00]" value={matchForm[input.field]} onChange={e => setMatchForm(f => ({ ...f, [input.field]: e.target.value }))} required>
                        <option value="">SELECT_TEAM</option>
                        {input.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={input.type} className="w-full bg-black border border-white/10 p-3 text-white font-bold outline-none focus:border-[#ccff00]" value={matchForm[input.field]} onChange={e => setMatchForm(f => ({ ...f, [input.field]: e.target.value }))} placeholder={input.placeholder} required />
                    )}
                  </div>
                ))}
                
                <button type="submit" disabled={savingMatch} className="w-full bg-[#ccff00] text-black font-black py-4 uppercase italic tracking-tighter mt-4 hover:bg-[#e6ff80] disabled:opacity-50">
                  {savingMatch ? 'UPLOADING...' : 'CONFIRM MATCH'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Detail Overlay */}
      {showTeamOverlay && (
        <React.Suspense fallback={<div className="fixed inset-0 bg-black/80 flex items-center justify-center text-[#ccff00] font-black italic">LOADING_SQUAD...</div>}>
          <TeamDetailOverlayLazy
            open={showTeamOverlay}
            onClose={() => setShowTeamOverlay(false)}
            team={teamDetail}
            leader={teamDetail.leader}
            members={teamDetail.members}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default EventDetail;