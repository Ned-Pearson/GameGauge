import React, { useState, useEffect } from 'react';
import API from '../utils/axios'; // Use the configured Axios instance
import { isAuthenticated } from '../utils/auth';
import './reviewButton.css';

const ReviewButton = ({ game }) => {
  const [review, setReview] = useState(''); // Current review content
  const [rating, setRating] = useState(null); // Rating state, initially null
  const [message, setMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentReview();
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(prevState => {
      console.log('Dropdown state before toggle:', prevState); // Debugging line
      return !prevState;
    });
  };

  const fetchCurrentReview = async () => {
    try {
      const response = await API.get(`/reviews/${game.id}`);
      if (response.data.review) {
        setReview(response.data.review.text);
        setRating(response.data.review.rating); // Fetch and set rating if it exists
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setReview(''); // No review found
        setRating(null); // No rating found
      } else {
        console.error('Error fetching review:', error);
      }
    }
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };

  const handleRatingChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setRating(value);
  };

  const handleReviewSubmit = async () => {
    try {
      if (review) {
        await API.post('/reviews', {
          gameId: game.id,
          gameName: game.name, // Pass game name
          imageUrl: game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : '',
          reviewText: review,
          rating: rating 
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setMessage('Review submitted successfully!');
      } else {
        setMessage('Review cannot be empty!');
      }
      setDropdownOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Failed to submit review.');
      setTimeout(() => setMessage(''), 3000);
    }
  };  

  if (!isAuthenticated()) {
    return <p>For full features, please log in.</p>;
  }

  return (
    <div className="review-button-container">
      <button onClick={toggleDropdown} className="review-button">
        {review ? `Edit Review` : 'Write a Review'}
      </button>
      {dropdownOpen && (
        <div className="review-form-container">
          <textarea
            value={review}
            onChange={handleReviewChange}
            placeholder="Write your review here..."
            rows="4"
            cols="50"
          />
          <div className="rating-input-container">
            <label htmlFor="rating">Rating (Optional):</label>
            <input
              id="rating"
              type="number"
              value={rating || ''} // If rating is null, show empty string
              onChange={handleRatingChange}
              min="0"
              max="10" // Forces review to either be from 0 - 10 (0 being unrated)
              placeholder="Rate from 1 to 10"
            />
          </div>
          <div className="review-form-actions">
            <button onClick={handleReviewSubmit} className="submit-review-button">
              {review ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
      {message && <p className="review-message">{message}</p>}
    </div>
  );
};

export default ReviewButton;
