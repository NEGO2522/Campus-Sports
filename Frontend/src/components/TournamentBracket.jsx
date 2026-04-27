import React, { useState } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TournamentBracket = () => {
  const navigate = useNavigate();
  
  // Tournament data
  const tournamentData = {
    title: "Campus Sports Championship 2024",
    status: "Completed",
    startDate: "March 15, 2024",
    endDate: "March 22, 2024",
    rounds: {
      quarterFinals: [
        {
          id: 'qf1',
          title: 'Quarter Final 1',
          team1: { name: 'Thunder Bolts', score: 1, winner: true },
          team2: { name: 'Eagles', score: 0, winner: false },
          date: 'March 15, 2024',
          time: '10:00 AM'
        },
        {
          id: 'qf2',
          title: 'Quarter Final 2',
          team1: { name: 'Storm', score: 2, winner: true },
          team2: { name: 'Wolves', score: 1, winner: false },
          date: 'March 15, 2024',
          time: '2:00 PM'
        },
        {
          id: 'qf3',
          title: 'Quarter Final 3',
          team1: { name: 'Lightning FC', score: 4, winner: true },
          team2: { name: 'Knights', score: 1, winner: false },
          date: 'March 16, 2024',
          time: '10:00 AM'
        },
        {
          id: 'qf4',
          title: 'Quarter Final 4',
          team1: { name: 'Fire', score: 3, winner: true },
          team2: { name: 'Tigers', score: 2, winner: false },
          date: 'March 16, 2024',
          time: '2:00 PM'
        }
      ],
      semiFinals: [
        {
          id: 'sf1',
          title: 'Semi Final 1',
          team1: { name: 'Thunder Bolts', score: 2, winner: true },
          team2: { name: 'Storm', score: 0, winner: false },
          date: 'March 19, 2024',
          time: '10:00 AM'
        },
        {
          id: 'sf2',
          title: 'Semi Final 2',
          team1: { name: 'Lightning FC', score: 3, winner: true },
          team2: { name: 'Fire', score: 2, winner: false },
          date: 'March 19, 2024',
          time: '2:00 PM'
        }
      ],
      final: {
        id: 'final',
        title: 'FINAL',
        team1: { name: 'Thunder Bolts', score: 3, winner: true },
        team2: { name: 'Lightning FC', score: 1, winner: false },
        date: 'March 22, 2024',
        time: '3:00 PM'
      },
      winner: { name: 'Thunder Bolts', trophy: '🏆' }
    }
  };

  const [selectedMatch, setSelectedMatch] = useState(null);

  const MatchCard = ({ match, size = 'normal', showDate = false }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedMatch(match)}
      className={`
        bg-white rounded-lg border-2 shadow-lg cursor-pointer transition-all duration-300
        ${size === 'large' ? 'p-6 border-yellow-400' : size === 'small' ? 'p-3 border-gray-200' : 'p-4 border-gray-200'}
        hover:shadow-xl hover:border-blue-300
        ${size === 'small' ? 'max-w-[180px]' : ''}
      `}
    >
      <div className="text-center mb-3">
        <h3 className={`font-bold text-gray-700 ${
          size === 'large' ? 'text-lg' : size === 'small' ? 'text-xs' : 'text-sm'
        }`}>
          {match.title}
        </h3>
        {showDate && (
          <p className="text-xs text-gray-500 mt-1">
            {match.date} - {match.time}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className={`
          flex justify-between items-center px-2 py-1 rounded border
          ${match.team1.winner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
        `}>
          <span className={`font-medium ${
            size === 'large' ? 'text-base' : size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {match.team1.name}
          </span>
          <span className={`
            font-bold ${size === 'large' ? 'text-lg' : size === 'small' ? 'text-xs' : 'text-sm'}
            ${match.team1.winner ? 'text-green-600' : 'text-gray-600'}
          `}>
            {match.team1.score}
          </span>
          {match.team1.winner && <FaCrown className={`text-yellow-500 ml-1 ${
            size === 'small' ? 'text-xs' : ''
          }`} />}
        </div>
        
        <div className={`
          flex justify-between items-center px-2 py-1 rounded border
          ${match.team2.winner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
        `}>
          <span className={`font-medium ${
            size === 'large' ? 'text-base' : size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {match.team2.name}
          </span>
          <span className={`
            font-bold ${size === 'large' ? 'text-lg' : size === 'small' ? 'text-xs' : 'text-sm'}
            ${match.team2.winner ? 'text-green-600' : 'text-gray-600'}
          `}>
            {match.team2.score}
          </span>
          {match.team2.winner && <FaCrown className={`text-yellow-500 ml-1 ${
            size === 'small' ? 'text-xs' : ''
          }`} />}
        </div>
      </div>
    </motion.div>
  );

  const ConnectionLine = ({ direction = 'horizontal', className = '' }) => (
    <div className={`
      bg-gradient-to-r from-blue-400 to-purple-500 
      ${direction === 'horizontal' ? 'h-1 w-16' : 'w-1 h-16'}
      ${className}
    `} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <FaTrophy className="text-yellow-500 mr-3" />
              {tournamentData.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full font-medium ${
                tournamentData.status === 'Completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {tournamentData.status}
              </span>
              <span>{tournamentData.startDate} - {tournamentData.endDate}</span>
            </div>
          </motion.div>
        </div>

        {/* Winner Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-2xl p-8 shadow-2xl mx-auto max-w-md">
            <div className="text-6xl mb-4">{tournamentData.rounds.winner.trophy}</div>
            <h2 className="text-2xl font-bold mb-2">CHAMPION</h2>
            <h3 className="text-3xl font-extrabold">{tournamentData.rounds.winner.name}</h3>
            <div className="flex justify-center mt-4 space-x-2">
              <FaMedal className="text-yellow-200 text-2xl" />
              <FaCrown className="text-yellow-200 text-2xl" />
              <FaMedal className="text-yellow-200 text-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Tournament Bracket - Horizontal Layout */}
        <div className="overflow-x-auto">
          <div className="min-w-[1200px] mx-auto">
            <div className="grid grid-cols-7 gap-8 items-center">
              
              {/* Quarter Finals - Left Side */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-sm font-bold text-gray-700 text-center mb-4">QUARTER FINALS</h3>
                <div className="space-y-16">
                  <MatchCard match={tournamentData.rounds.quarterFinals[0]} size="small" />
                  <MatchCard match={tournamentData.rounds.quarterFinals[1]} size="small" />
                  <MatchCard match={tournamentData.rounds.quarterFinals[2]} size="small" />
                  <MatchCard match={tournamentData.rounds.quarterFinals[3]} size="small" />
                </div>
              </motion.div>

              {/* Connection Lines - QF to SF */}
              <div className="flex flex-col justify-center space-y-16 h-full">
                <div className="flex items-center">
                  <ConnectionLine className="w-8" />
                  <div className="w-2 h-16 bg-gradient-to-b from-blue-400 to-purple-500"></div>
                  <ConnectionLine className="w-8" />
                </div>
                <div className="flex items-center">
                  <ConnectionLine className="w-8" />
                  <div className="w-2 h-16 bg-gradient-to-b from-blue-400 to-purple-500"></div>
                  <ConnectionLine className="w-8" />
                </div>
              </div>

              {/* Semi Finals - Left */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                <h3 className="text-sm font-bold text-gray-700 text-center mb-4">SEMI FINALS</h3>
                <div className="space-y-32">
                  <MatchCard match={tournamentData.rounds.semiFinals[0]} />
                  <MatchCard match={tournamentData.rounds.semiFinals[1]} />
                </div>
              </motion.div>

              {/* Connection Lines - SF to Final */}
              <div className="flex flex-col justify-center items-center h-full">
                <div className="flex items-center">
                  <ConnectionLine className="w-12" />
                  <div className="w-2 h-32 bg-gradient-to-b from-blue-400 to-purple-500"></div>
                  <ConnectionLine className="w-12" />
                </div>
              </div>

              {/* Final */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col items-center justify-center"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaTrophy className="text-yellow-500 mr-2" />
                  FINAL
                </h2>
                <MatchCard match={tournamentData.rounds.final} size="large" showDate />
              </motion.div>

              {/* Connection Line - Final to Winner */}
              <div className="flex justify-center items-center">
                <ConnectionLine className="w-16" />
              </div>

              {/* Winner */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-xl text-center">
                  <div className="text-4xl mb-2">{tournamentData.rounds.winner.trophy}</div>
                  <h3 className="text-lg font-bold mb-1">CHAMPION</h3>
                  <h4 className="text-xl font-extrabold">{tournamentData.rounds.winner.name}</h4>
                  <div className="flex justify-center mt-2 space-x-1">
                    <FaMedal className="text-yellow-200" />
                    <FaCrown className="text-yellow-200" />
                    <FaMedal className="text-yellow-200" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tournament Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tournament Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Teams</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">7</div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">21</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedMatch.title}</h3>
              <div className="space-y-4 mb-6">
                <div className={`
                  flex justify-between items-center px-4 py-3 rounded-lg border-2
                  ${selectedMatch.team1.winner ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}
                `}>
                  <span className="font-bold text-lg">{selectedMatch.team1.name}</span>
                  <span className="text-2xl font-bold text-green-600">{selectedMatch.team1.score}</span>
                </div>
                <div className="text-gray-500 font-medium">VS</div>
                <div className={`
                  flex justify-between items-center px-4 py-3 rounded-lg border-2
                  ${selectedMatch.team2.winner ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}
                `}>
                  <span className="font-bold text-lg">{selectedMatch.team2.name}</span>
                  <span className="text-2xl font-bold text-green-600">{selectedMatch.team2.score}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-6">
                <p><strong>Date:</strong> {selectedMatch.date}</p>
                <p><strong>Time:</strong> {selectedMatch.time}</p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;