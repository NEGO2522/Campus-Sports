import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Participate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Participate in Event</h2>
      <div className="space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => navigate(`/events/${id}/create-team`)}
        >
          Create Team
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          onClick={() => navigate(`/events/${id}/join-team`)}
        >
          Join Team
        </button>
      </div>
    </div>
  );
};

export default Participate;
