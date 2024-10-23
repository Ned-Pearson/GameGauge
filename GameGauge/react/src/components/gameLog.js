import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './gameLog.css'; 

const GameLog = ({ log }) => {
  return (
    <div className="game-log">
      <Link to={`/game/${log.game_id}`} className="game-link">
        <div className="image-container">
          <img src={log.image_url} alt={log.game_name} className="game-image" />
          <div className="overlay">
            <div className="overlay-text">
              <h3>{log.game_name}</h3>
              <p>Status: {log.status}</p>
              <p>Logged on: {new Date(log.log_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Link>
      {/* Rating and Review Indicator */}
      <div className="rating-review">
        {log.rating !== null && (
          <div className="rating">
            <p>Rating: {log.rating}/10</p>
          </div>
        )}
        {log.review_text && (
          <div className="review-indicator">
            <span className="review-icon">≡</span>
          </div>
        )}
      </div>
    </div>
  );
};

GameLog.propTypes = {
  log: PropTypes.shape({
    game_id: PropTypes.number.isRequired,
    game_name: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    log_date: PropTypes.string.isRequired,
    rating: PropTypes.number,  // Rating is optional
    review_text: PropTypes.string, // Review text is optional
  }).isRequired,
};

export default GameLog;
