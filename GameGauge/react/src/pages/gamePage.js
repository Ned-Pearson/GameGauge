import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/axios';
import './gamePage.css';
import LogButton from '../components/logButton';
import RateReviewButton from '../components/rateReviewButton';
import RatingChart from '../components/ratingChart';

function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [logCounts, setLogCounts] = useState({ completedCount: 0, playingCount: 0 });
  const [ratings, setRatings] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [friendReviews, setFriendReviews] = useState([]);
  const [similarGames, setSimilarGames] = useState([]); // New state for similar games
  const [loading, setLoading] = useState(true);
  const [showMoreFriendReviews, setShowMoreFriendReviews] = useState(false);
  const [showMoreReviews, setShowMoreReviews] = useState(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await API.post('/game', { gameId: id });
        setGame(gameResponse.data.game);

        const logCountsResponse = await API.get(`/logs/${id}/counts`);
        setLogCounts(logCountsResponse.data);

        const ratingsResponse = await API.get(`/games/${id}/ratings`);
        setRatings(ratingsResponse.data);

        const reviewsResponse = await API.get(`/games/${id}/reviews`);
        setReviews(reviewsResponse.data.reviews);

        const token = localStorage.getItem('token');
        const friendReviewsResponse = await API.get(`/game/${id}/friend-reviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFriendReviews(friendReviewsResponse.data.reviews);

        // Fetch similar games
        const similarGamesResponse = await API.get(`/similar-games/${id}`);
        setSimilarGames(similarGamesResponse.data.similarGames);

      } catch (error) {
        console.error('Error fetching game details, log counts, or reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const displayedFriendReviews = showMoreFriendReviews ? friendReviews : friendReviews.slice(0, 4);
  const displayedReviews = showMoreReviews ? reviews : reviews.slice(0, 4);

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
      <div className="game-cover-art">
        <img
          src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/400x600'}
          alt={game.name}
        />
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
        
        <p className="game-studio">
          <strong>Developer: </strong>
          {game.developers || 'Unknown Developer'}
        </p>
        
        <p className="game-summary">{game.summary || 'No summary available.'}</p>

        <p className="game-genres">
          <strong>Genres: </strong>
          {game.genres ? game.genres.map(genre => genre.name).join(', ') : 'N/A'}
        </p>

        <p className="game-platforms">
          <strong>Platforms: </strong>
          {game.platforms ? game.platforms.map(platform => platform.name).join(', ') : 'N/A'}
        </p>

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

        {/* Display Friend Reviews */}
        <div className="friend-reviews">
          <h2>Friend Reviews</h2>
          {displayedFriendReviews.length > 0 ? (
            <ul>
              {displayedFriendReviews.map((review, index) => (
                <li key={index} className="review-item">
                  <p><strong>{review.username}</strong> rated: {review.rating || 'No rating given'}</p>
                  <p>{review.review_text}</p>
                  <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No friend reviews available for this game.</p>
          )}
          {friendReviews.length > 4 && (
            <button onClick={() => setShowMoreFriendReviews(!showMoreFriendReviews)}>
              {showMoreFriendReviews ? 'Show Less' : 'Load More'}
            </button>
          )}
        </div>

        {/* Display Recent Reviews */}
        <div className="recent-reviews">
          <h2>Recent Reviews</h2>
          {displayedReviews.length > 0 ? (
            <ul>
              {displayedReviews.map((review, index) => (
                <li key={index} className="review-item">
                  <p><strong>{review.username}</strong> rated: {review.rating || 'No rating given'}</p>
                  <p>{review.review_text}</p>
                  <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews available for this game.</p>
          )}
          {reviews.length > 4 && (
            <button onClick={() => setShowMoreReviews(!showMoreReviews)}>
              {showMoreReviews ? 'Show Less' : 'Load More'}
            </button>
          )}
        </div>

        {/* Display Similar Games */}
        <div className="similar-games">
          <h2>Similar Games</h2>
          {similarGames.length > 0 ? (
            <ul className="similar-games-list">
              {similarGames.map((similarGame) => (
                <li key={similarGame.id} className="similar-game-item">
                  <img
                    src={similarGame.cover ? `https:${similarGame.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/100x150'}
                    alt={similarGame.name}
                    className="similar-game-cover"
                  />
                  <p className="similar-game-name">{similarGame.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No similar games found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetails;
