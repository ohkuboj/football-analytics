import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';

function App() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState(null);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes, positionsRes] = await Promise.all([
          axios.get('http://localhost:8000/players'),
          axios.get('http://localhost:8000/teams'),
          axios.get('http://localhost:8000/positions')
        ]);
        
        setPlayers(playersRes.data);
        setTeams(['All', ...teamsRes.data.teams]);
        setPositions(['All', ...positionsRes.data.positions]);
        
        if (playersRes.data.length > 0) {
          setSelectedPlayer1(playersRes.data[0]);
          setSelectedPlayer2(playersRes.data[1]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handlePlayer1Change = (event) => {
    const player = players.find(p => p.name === event.target.value);
    setSelectedPlayer1(player);
  };

  const handlePlayer2Change = (event) => {
    const player = players.find(p => p.name === event.target.value);
    setSelectedPlayer2(player);
  };

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  const handlePositionChange = (event) => {
    setSelectedPosition(event.target.value);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  const filteredPlayers = players.filter(player => {
    const teamMatch = selectedTeam === 'All' || player.team === selectedTeam;
    const positionMatch = selectedPosition === 'All' || player.position === selectedPosition;
    return teamMatch && positionMatch;
  });

  if (!selectedPlayer1 || !selectedPlayer2) {
    return <div>Loading...</div>;
  }

  const createRadarData = (player) => [
    { subject: 'Goals', value: player.goals * 100 },
    { subject: 'Assists', value: player.assists * 100 },
    { subject: 'Passing', value: player.passing_accuracy * 100 },
    { subject: 'Tackles', value: player.tackles * 100 },
    { subject: 'Interceptions', value: player.interceptions * 100 },
    { subject: 'Dribbles', value: player.dribbles * 100 },
    { subject: 'Shots on Target', value: player.shots_on_target * 100 },
  ];

  const data1 = createRadarData(selectedPlayer1);
  const data2 = createRadarData(selectedPlayer2);

  // Combine data for both players
  const combinedData = data1.map((item, index) => ({
    subject: item.subject,
    player1: item.value,
    player2: data2[index].value
  }));

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>EPL Player Analytics</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <select 
          value={selectedTeam} 
          onChange={handleTeamChange}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          {teams.map(team => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <select 
          value={selectedPosition} 
          onChange={handlePositionChange}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          {positions.map(position => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>

        <button 
          onClick={toggleComparisonMode}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: comparisonMode ? '#4CAF50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {comparisonMode ? 'Single View' : 'Compare Players'}
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <select 
          value={selectedPlayer1.name} 
          onChange={handlePlayer1Change}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          {filteredPlayers.map(player => (
            <option key={player.name} value={player.name}>
              {player.name} ({player.team})
            </option>
          ))}
        </select>

        {comparisonMode && (
          <select 
            value={selectedPlayer2.name} 
            onChange={handlePlayer2Change}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            {filteredPlayers.map(player => (
              <option key={player.name} value={player.name}>
                {player.name} ({player.team})
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div>
          <h2>{selectedPlayer1.name}</h2>
          <p>Team: {selectedPlayer1.team}</p>
          <p>Position: {selectedPlayer1.position}</p>
        </div>
        {comparisonMode && (
          <div>
            <h2>{selectedPlayer2.name}</h2>
            <p>Team: {selectedPlayer2.team}</p>
            <p>Position: {selectedPlayer2.position}</p>
          </div>
        )}
      </div>

      <div style={{ height: '500px', width: '100%' }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonMode ? combinedData : data1}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name={selectedPlayer1.name}
              dataKey={comparisonMode ? "player1" : "value"}
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            {comparisonMode && (
              <Radar
                name={selectedPlayer2.name}
                dataKey="player2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            )}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App; 