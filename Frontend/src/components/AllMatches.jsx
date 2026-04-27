import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const AllMatches = ({ matches, eventName }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">All Matches - {eventName}</h2>
      {matches.length === 0 ? (
        <div className="text-center text-gray-500">No matches found.</div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="font-bold text-orange-600 text-lg mb-1 truncate">{match.matchName}</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-700">{match.team1?.name || match.team1 || 'Team 1'}</span>
                  <span className="font-bold text-blue-500">{match[`score_${(match.team1?.name || match.team1 || 'Team 1').replace(/[~*\/\[\]]/g, '_')}`] ?? <span className="text-gray-400 font-normal">No score</span>}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-700">{match.team2?.name || match.team2 || 'Team 2'}</span>
                  <span className="font-bold text-blue-500">{match[`score_${(match.team2?.name || match.team2 || 'Team 2').replace(/[~*\/\[\]]/g, '_')}`] ?? <span className="text-gray-400 font-normal">No score</span>}</span>
                </div>
                {match.location && (
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                    <span>{match.location}</span>
                  </div>
                )}
                {match.dateTime && (
                  <div className="text-xs text-gray-500 mt-1">{format(match.dateTime, 'MMM d, h:mma').toLowerCase()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMatches;
