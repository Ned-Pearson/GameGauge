import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './gamePage.css';

function GameDetails() {
  const { id } = useParams(); // This retrieves the game's id from the URL
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/game', { gameId: id });
        setGame(response.data.game);
      } catch (error) {
        console.error('Error fetching game details:', error);
      }
      setLoading(false);
    };

    fetchGameDetails();
  }, [id]);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Loading game details...</p></div>;
  }

  if (!game) {
    return <p>Game details not found.</p>;
  }

  return (
    <div className="game-details-page">
      {/* Main artwork or cover image */}
      <div className="game-cover-art">
        <img src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/400x600'} alt={game.name} />
      </div>
      <div className="game-details">
        <h1 className="game-title">{game.name}</h1>
        <p className="game-release-date">{new Date(game.first_release_date * 1000).toLocaleDateString()}</p>
        <p className="game-studio">{game.involved_companies?.[0]?.company?.name || 'Unknown Studio'}</p>
        <p className="game-summary">{game.summary || 'No summary available.'}</p>

        {/* Placeholder for rating, review, and log */}
        <div className="game-actions">
          <button className="rate-button">Rate</button>
          <button className="review-button">Review</button>
          <button className="log-button">Log</button>
        </div>
      </div>
    </div>
  );
}

export default GameDetails;
