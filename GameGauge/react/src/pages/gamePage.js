import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './gamePage.css';
import LogButton from '../components/logButton';
import RateReviewButton from '../components/rateReviewButton';
import RatingChart from '../components/ratingChart';

function GameDetails() {
  const { id } = useParams(); // This retrieves the game's id from the URL
  const [game, setGame] = useState(null);
  const [logCounts, setLogCounts] = useState({ completedCount: 0, playingCount: 0 });
  const [ratings, setRatings] = useState(null); // State to hold ratings
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await axios.post('http://localhost:5000/api/game', { gameId: id });
        setGame(gameResponse.data.game);

        // Debugging: Check the fetched game details
        console.log('Fetched game details:', gameResponse.data.game);

        // Fetch log counts
        const logCountsResponse = await axios.get(`http://localhost:5000/api/logs/${id}/counts`);
        setLogCounts(logCountsResponse.data);

        // Debugging: Check the fetched log counts
        console.log('Fetched log counts:', logCountsResponse.data);

        // Fetch ratings for the game
        const ratingsResponse = await axios.get(`http://localhost:5000/api/games/${id}/ratings`);
        setRatings(ratingsResponse.data);

        // Debugging: Check the fetched ratings
        console.log('Fetched ratings:', ratingsResponse.data);
      } catch (error) {
        console.error('Error fetching game details or log counts:', error);
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and error cases
      }
    };

    fetchGameDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return <p>Game details not found.</p>;
  }

  return (
    <div className="game-details-page">
      {/* Main artwork or cover image */}
      <div className="game-cover-art">
        <img
          src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/400x600'}
          alt={game.name}
        />

        {/* Log Counts under the cover */}
        <div className="game-status-icons">
          <div className="status-icon" title="Completed">
            <i className="fas fa-check-circle"></i>
            <span>{logCounts.completedCount}</span>
          </div>
          <div className="status-icon" title="Playing">
            <i className="fas fa-play-circle"></i>
            <span>{logCounts.playingCount}</span>
          </div>
        </div>
      </div>

      <div className="game-details">
        <h1 className="game-title">{game.name}</h1>
        <p className="game-release-date">{new Date(game.first_release_date * 1000).toLocaleDateString()}</p>
        <p className="game-studio">{game.involved_companies?.[0]?.company?.name || 'Unknown Studio'}</p>
        <p className="game-summary">{game.summary || 'No summary available.'}</p>

        {/* Genres */}
        <p className="game-genres">
          <strong>Genres: </strong>
          {game.genres ? game.genres.map(genre => genre.name).join(', ') : 'N/A'}
        </p>

        {/* Platforms */}
        <p className="game-platforms">
          <strong>Platforms: </strong>
          {game.platforms ? game.platforms.map(platform => platform.name).join(', ') : 'N/A'}
        </p>

        {/* Rating, Review, and Log */}
        <div className="game-actions">
          <RateReviewButton game={game} />
          <LogButton game={game} />
          {ratings && ratings.individualRatings ? (
            <RatingChart
              individualRatings={ratings.individualRatings}
              averageRating={ratings.averageRating}
              totalRatings={ratings.totalRatings}
            />
          ) : (
            <p>No ratings available to display the chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetails;
