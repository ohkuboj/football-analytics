import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const addToFavorites = () => {
    if (selectedPlayer1 && selectedPlayer2) {
      const newFavorite = {
        player1: selectedPlayer1,
        player2: selectedPlayer2,
        date: new Date().toISOString()
      };
      setFavorites([...favorites, newFavorite]);
    }
  };

  const removeFromFavorites = (index) => {
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
  };

  const loadFavorite = (favorite) => {
    setSelectedPlayer1(favorite.player1);
    setSelectedPlayer2(favorite.player2);
    setComparisonMode(true);
  };

  const filteredPlayers = players.filter(player => {
    const teamMatch = selectedTeam === 'All' || player.team === selectedTeam;
    const positionMatch = selectedPosition === 'All' || player.position === selectedPosition;
    const searchMatch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    return teamMatch && positionMatch && searchMatch;
  });

  if (!selectedPlayer1 || !selectedPlayer2) {
    return <div>Loading...</div>;
  }

  const calculatePercentile = (value, allValues) => {
    const sortedValues = [...allValues].sort((a, b) => a - b);
    const index = sortedValues.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sortedValues.length) * 100;
  };

  const createRadarData = (player) => {
    // Get all values for each statistic
    const allGoals = players.map(p => p.goals);
    const allAssists = players.map(p => p.assists);
    const allPassing = players.map(p => p.passing_accuracy * 100);
    const allTackles = players.map(p => p.tackles);
    const allInterceptions = players.map(p => p.interceptions);
    const allDribbles = players.map(p => p.dribbles);
    const allShotsOnTarget = players.map(p => p.shots_on_target);

    return [
      { 
        subject: 'Goals (Percentile)', 
        value: calculatePercentile(player.goals, allGoals),
        rawValue: player.goals
      },
      { 
        subject: 'Assists (Percentile)', 
        value: calculatePercentile(player.assists, allAssists),
        rawValue: player.assists
      },
      { 
        subject: 'Passing % (Percentile)', 
        value: calculatePercentile(player.passing_accuracy * 100, allPassing),
        rawValue: player.passing_accuracy * 100
      },
      { 
        subject: 'Tackles (Percentile)', 
        value: calculatePercentile(player.tackles, allTackles),
        rawValue: player.tackles
      },
      { 
        subject: 'Interceptions (Percentile)', 
        value: calculatePercentile(player.interceptions, allInterceptions),
        rawValue: player.interceptions
      },
      { 
        subject: 'Dribbles (Percentile)', 
        value: calculatePercentile(player.dribbles, allDribbles),
        rawValue: player.dribbles
      },
      { 
        subject: 'Shots on Target (Percentile)', 
        value: calculatePercentile(player.shots_on_target, allShotsOnTarget),
        rawValue: player.shots_on_target
      },
    ];
  };

  const data1 = createRadarData(selectedPlayer1);
  const data2 = createRadarData(selectedPlayer2);

  const combinedData = data1.map((item, index) => ({
    subject: item.subject,
    player1: item.value,
    player2: data2[index].value,
    player1Raw: item.rawValue,
    player2Raw: data2[index].rawValue
  }));

  // Find the maximum value across all statistics
  const maxValue = Math.max(
    ...data1.map(item => item.value),
    ...data2.map(item => item.value)
  );

  // Mock season performance data
  const seasonData = [
    { month: 'Aug', player1: 85, player2: 75 },
    { month: 'Sep', player1: 78, player2: 82 },
    { month: 'Oct', player1: 82, player2: 79 },
    { month: 'Nov', player1: 88, player2: 85 },
    { month: 'Dec', player1: 85, player2: 88 },
    { month: 'Jan', player1: 90, player2: 82 }
  ];

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>EPL Player Analytics</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ padding: '10px', fontSize: '16px', width: '200px' }}
        />
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

        {comparisonMode && (
          <button 
            onClick={addToFavorites}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Comparison
          </button>
        )}

        <button 
          onClick={() => setShowFavorites(!showFavorites)}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: '#FFC107',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showFavorites ? 'Hide Favorites' : 'Show Favorites'}
        </button>
      </div>

      {showFavorites && (
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Saved Comparisons</h3>
          {favorites.map((favorite, index) => (
            <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
              <span>{favorite.player1.name} vs {favorite.player2.name}</span>
              <button 
                onClick={() => loadFavorite(favorite)}
                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Load
              </button>
              <button 
                onClick={() => removeFromFavorites(index)}
                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

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

      <div style={{ marginTop: '40px' }}>
        <h3>Season Performance Trend</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="player1" stroke="#8884d8" name={selectedPlayer1.name} />
              {comparisonMode && (
                <Line type="monotone" dataKey="player2" stroke="#82ca9d" name={selectedPlayer2.name} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Statistics Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Statistic</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>{selectedPlayer1.name}</th>
              {comparisonMode && (
                <th style={{ padding: '10px', textAlign: 'right' }}>{selectedPlayer2.name}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data1.map((stat, index) => (
              <tr key={stat.subject} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{stat.subject}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {stat.subject.includes('Passing') ? 
                    `${stat.rawValue.toFixed(1)}% (${stat.value.toFixed(1)}th percentile)` : 
                    `${Math.round(stat.rawValue)} (${stat.value.toFixed(1)}th percentile)`}
                </td>
                {comparisonMode && (
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {stat.subject.includes('Passing') ? 
                      `${data2[index].rawValue.toFixed(1)}% (${data2[index].value.toFixed(1)}th percentile)` : 
                      `${Math.round(data2[index].rawValue)} (${data2[index].value.toFixed(1)}th percentile)`}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App; 