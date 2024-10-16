import React, { useState, useEffect } from 'react';
import API from '../utils/axios';
import { isAuthenticated } from '../utils/auth';
import './rateReviewButton.css';

const RateReviewButton = ({ game }) => {
  const [rating, setRating] = useState(null); // Rating state
  const [hoverRating, setHoverRating] = useState(null); // Hover effect for rating
  const [review, setReview] = useState(''); // Optional review content
  const [message, setMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentReview();
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const fetchCurrentReview = async () => {
    try {
      const response = await API.get(`/reviews/${game.id}`);
      if (response.data.review) {
        setReview(response.data.review.review_text || '');
        setRating(response.data.review.rating);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      if (review || rating !== null) {  // Allow submission with either a review or rating
        await API.post('/reviews', {
          gameId: game.id,
          gameName: game.name,
          imageUrl: game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : '',
          reviewText: review || null,  // Default to null if no review is provided
          rating: rating
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setMessage('Review submitted successfully!');
        fetchCurrentReview(); // Refetch the review after submission
        setDropdownOpen(false);
        
        // Set a timeout to clear the message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Please enter a rating or review!');
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Failed to submit review.');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    }
  };  

  const handleBarMouseEnter = (index) => {
    setHoverRating(index + 1);
  };

  const handleBarMouseLeave = () => {
    setHoverRating(null);
  };

  const handleBarClick = (index) => {
    setRating(index + 1);
  };

  const getBarColor = (currentRating, barIndex) => {
    if (currentRating >= 1 && currentRating <= 3) {
      return barIndex <= currentRating ? 'red-bar' : '';
    } else if (currentRating >= 4 && currentRating <= 6) {
      return barIndex <= currentRating ? 'orange-bar' : '';
    } else if (currentRating >= 7 && currentRating <= 9) {
      return barIndex <= currentRating ? 'green-bar' : '';
    } else if (currentRating === 10) {
      return barIndex <= currentRating ? 'purple-bar' : '';
    } else {
      return '';
    }
  };

  return (
    <div className="rate-review-container">
      <button onClick={toggleDropdown} className="rate-review-button">
        {rating || review ? 'Edit Rating/Review' : 'Rate/Review'}
      </button>

      {dropdownOpen && (
        <div className="rate-review-dropdown">
          {/* Rating Bar Chart */}
          <div className="rating-bar-container">
            {[...Array(10)].map((_, index) => (
                <div
                key={index}
                className={`rating-bar ${getBarColor(hoverRating || rating, index + 1)}`}
                onMouseEnter={() => handleBarMouseEnter(index)}
                onMouseLeave={handleBarMouseLeave}
                onClick={() => handleBarClick(index)}
                style={{ height: `${(index + 1) * 10}%` }} // Dynamically set height for bars
                />
            ))}
            </div>

          {/* Review Textarea */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here (optional)..."
            rows="4"
            cols="50"
          />

          <div className="rate-review-actions">
            <button onClick={handleReviewSubmit} className="submit-rate-review-button">
              {rating || review ? 'Update' : 'Submit'}
            </button>
          </div>

          {message && <p className="review-message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default RateReviewButton;
