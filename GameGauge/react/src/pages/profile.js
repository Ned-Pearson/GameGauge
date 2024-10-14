import React, { useContext, useEffect, useState } from 'react';
import API from '../utils/axios';
import { AuthContext } from '../context/authContext';
import GameLog from '../components/gameLog';
import './profile.css';

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const [logs, setLogs] = useState({
    completed: [],
    playing: [],
    wantToPlay: [],
    backlog: [],
    dropped: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch user's logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await API.get('/logs', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const logsData = response.data.logs;

        // Group logs by their status
        const groupedLogs = {
          completed: logsData.filter(log => log.status === 'completed'),
          playing: logsData.filter(log => log.status === 'playing'),
          wantToPlay: logsData.filter(log => log.status === 'want to play'),
          backlog: logsData.filter(log => log.status === 'backlog'),
          dropped: logsData.filter(log => log.status === 'dropped'),
        };

        setLogs(groupedLogs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError(true);
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [auth.token]);

  if (loading) {
    return <div className="profile-page"><p>Loading your logs...</p></div>;
  }

  if (error) {
    return <div className="profile-page"><p>Error loading your logs. Please try again later.</p></div>;
  }

  return (
    <div className="profile-page">
      <h1>{auth.username}'s Profile</h1>
      
      {/* Status Navigation Bar */}
      <div className="status-nav">
        <a href="#completed">Completed</a>
        <a href="#playing">Playing</a>
        <a href="#wantToPlay">Want to Play</a>
        <a href="#backlog">Backlog</a>
        <a href="#dropped">Dropped</a>
      </div>

      <h2>Your Logged Games</h2>
      {Object.values(logs).every(section => section.length === 0) ? (
        <p>You have not logged any games yet.</p>
      ) : (
        <div>
          {/* Completed Section */}
          <div id="completed" className="status-section">
            <h2>Completed</h2>
            <div className="logs-container">
              {logs.completed.length > 0 ? (
                logs.completed.map((log) => (
                  <GameLog key={log.game_id} log={log} />
                ))
              ) : (
                <p>No completed games.</p>
              )}
            </div>
          </div>

          {/* Playing Section */}
          <div id="playing" className="status-section">
            <h2>Playing</h2>
            <div className="logs-container">
              {logs.playing.length > 0 ? (
                logs.playing.map((log) => (
                  <GameLog key={log.game_id} log={log} />
                ))
              ) : (
                <p>Not currently playing any games.</p>
              )}
            </div>
          </div>

          {/* Want to Play Section */}
          <div id="wantToPlay" className="status-section">
            <h2>Want to Play</h2>
            <div className="logs-container">
              {logs.wantToPlay.length > 0 ? (
                logs.wantToPlay.map((log) => (
                  <GameLog key={log.game_id} log={log} />
                ))
              ) : (
                <p>No games in want to play list.</p>
              )}
            </div>
          </div>

          {/* Backlog Section */}
          <div id="backlog" className="status-section">
            <h2>Backlog</h2>
            <div className="logs-container">
              {logs.backlog.length > 0 ? (
                logs.backlog.map((log) => (
                  <GameLog key={log.game_id} log={log} />
                ))
              ) : (
                <p>No backlog games yet.</p>
              )}
            </div>
          </div>

          {/* Dropped Section */}
          <div id="dropped" className="status-section">
            <h2>Dropped</h2>
            <div className="logs-container">
              {logs.dropped.length > 0 ? (
                logs.dropped.map((log) => (
                  <GameLog key={log.game_id} log={log} />
                ))
              ) : (
                <p>No games dropped yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
