import React, { useState, useEffect } from 'react';
import API from '../utils/axios'; 
import { isAuthenticated } from '../utils/auth'; 
import './logButton.css';

const LogButton = ({ game }) => {
  const [status, setStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState('');

  const statusOptions = ["completed", "playing", "backlog", "dropped", "want to play", "none"];

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentStatus();
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };

  const fetchCurrentStatus = async () => {
    try {
      const response = await API.get(`/logs/${game.id}`);
      setStatus(response.data.log.status);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setStatus('not logged');
      } else {
        console.error('Error fetching log status:', error);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (newStatus === 'none') {
        await API.delete(`/logs/${game.id}`);
        setStatus(null);
        setMessage('Log removed successfully!');
      } else {
        await API.post('/logs', {
          gameId: game.id,
          gameName: game.name,
          imageUrl: game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : '', // Use higher resolution
          status: newStatus,
        });
        setStatus(newStatus);
        setMessage('Log updated successfully!');
      }
      setDropdownOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error setting log status:', error);
      setMessage('Failed to update log.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isAuthenticated()) {
    return <p>For full features, please log in.</p>;
  }

  return (
    <div className="log-button-container">
      <button onClick={toggleDropdown} className="log-button">
        {status ? `Status: ${status}` : 'Log'}
      </button>
      {dropdownOpen && (
        <div className="dropdown-menu">
          {statusOptions.map(option => (
            <div
              key={option}
              className="dropdown-item"
              onClick={() => handleStatusChange(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {message && <p className="log-message">{message}</p>}
    </div>
  );
};

export default LogButton;
