import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaMedal, FaUsers } from 'react-icons/fa';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const Leaderboard = ({ limit }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Query to get teams ordered by points in descending order
      const q = query(
        collection(db, 'teams'),
        orderBy('points', 'desc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const teamsData = [];
        querySnapshot.forEach((doc) => {
          teamsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Add position based on sorted order
        const teamsWithPosition = teamsData.map((team, index) => ({
          ...team,
          position: index + 1
        }));
        
        setTeams(teamsWithPosition);
        setLoading(false);
      }, (error) => {
        console.error('Error getting teams:', error);
        setError('Failed to load leaderboard. Please try again later.');
        setLoading(false);
      });

      // Clean up the listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  }, []);

  // Apply limit if provided, otherwise show all
  const leaderboardData = limit ? teams.slice(0, limit) : teams;

  const getMedalColor = (position) => {
    switch (position) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getMedalIcon = (position) => {
    if (position <= 3) {
      return <FaTrophy className={`w-5 h-5 ${getMedalColor(position)}`} />;
    }
    return <span className="text-sm font-medium text-gray-500">{position}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full max-w-7xl mx-auto mt-20 mb-10">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaTrophy className="text-yellow-400 mr-2" />
          Leaderboard
        </h3>
        <p className="text-sm text-gray-500 mt-1">Top teams this season</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        <div className="hidden sm:grid grid-cols-12 px-4 sm:px-6 py-3 bg-gray-50 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Team</div>
          <div className="col-span-2 text-right">Matches</div>
          <div className="col-span-2 text-right">Points</div>
        </div>
        
        {(() => {
          if (loading) {
            return <div className="p-6 text-center text-gray-500">Loading leaderboard...</div>;
          }
          
          if (error) {
            return <div className="p-6 text-center text-red-500">{error}</div>;
          }
          
          if (teams.length === 0) {
            return <div className="p-6 text-center text-gray-500">No teams found. Check back later!</div>;
          }
          
          return leaderboardData.map((team) => (
            <div key={team.id} className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-2 sm:col-span-1 flex items-center">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${team.position <= 3 ? 'bg-opacity-20' : 'bg-gray-50'}`}>
                    {getMedalIcon(team.position)}
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-7 flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center mr-2 sm:mr-4">
                    <FaUsers className="text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{team.name}</p>
                    {team.members && (
                      <p className="text-[10px] text-gray-500">{team.members} members</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right text-xs sm:text-sm text-gray-500">
                  {team.matchesPlayed || 0}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{team.points || 0}</span>
                  <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs text-gray-500">pts</span>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>
      
      {limit && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 text-center">
          <Link 
            to="/leaderboard" 
            className="text-xs sm:text-sm font-medium text-green-600 hover:text-green-700 active:text-green-800 transition-colors"
          >
            View full leaderboard <span className="hidden sm:inline">→</span><span className="sm:hidden">›</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
