import React, { useContext, useEffect, useState } from 'react';
import API from '../utils/axios';
import { AuthContext } from '../context/authContext';
import GameLog from '../components/gameLog';
import './profile.css'; 

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch user's logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await API.get('/logs', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setLogs(response.data.logs);
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
      <h2>Your Games</h2>
      {logs.length === 0 ? (
        <p>You have not logged any games yet.</p>
      ) : (
        <div className="logs-container">
          {logs.map((log) => (
            <GameLog key={log.game_id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
