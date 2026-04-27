import React from 'react';

const TeamDetailOverlay = ({ open, onClose, team, leader, members }) => {
  if (!open || !team) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">{team.teamName}</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Team Leader</h3>
          <div className="space-y-1">
            <div><span className="font-medium">Name:</span> {leader.fullName}</div>
            <div><span className="font-medium">Email:</span> {leader.email}</div>
            <div><span className="font-medium">Reg. No:</span> {leader.registrationNumber}</div>
            <div><span className="font-medium">Mobile:</span> {leader.phoneNumber}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Members</h3>
          <ul className="list-disc ml-6">
            {members.map(m => (
              <li key={m.id} className="mb-1">
                <div className="space-y-1">
            <div><span className="font-medium">Name:</span> {m.fullName}</div>
            <div><span className="font-medium">Email:</span> {m.email}</div>
            <div><span className="font-medium">Reg. No:</span> {m.registrationNumber}</div>
            <div><span className="font-medium">Mobile:</span> {m.phoneNumber}</div>
          </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailOverlay;
