import React, { useEffect, useState } from 'react';
import API from '../utils/axios';
import { useParams } from 'react-router-dom';
import './profileReviews.css';
import { format } from 'date-fns'; // To format the date nicely

const ProfileReviews = () => {
  const { username } = useParams(); // Retrieve username from route params
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortOption, setSortOption] = useState('newest'); // Default sort option

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest-rating', label: 'Highest Rating' },
    { value: 'lowest-rating', label: 'Lowest Rating' }
  ];

  // Function to handle sorting change
  const handleSortChange = (sortValue) => {
    setSortOption(sortValue);
  };

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await API.get(`/reviews/user/${username}`, {
          params: { sort: sortOption } // Send the selected sort option to the backend
        });
        setReviews(response.data.reviews); 
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [username, sortOption]); // Re-fetch reviews when sortOption changes

  if (loading) {
    return <div className="reviews-page"><p>Loading reviews...</p></div>;
  }

  if (error) {
    return <div className="reviews-page"><p>Error loading reviews. Please try again later.</p></div>;
  }

  return (
    <div className="reviews-page">
      <h1>{username}'s Reviews</h1>

      {/* Sort Dropdown */}
      <div className="sort-container">
        <div className="dropdown">
          <button className="dropdown-button">
            Sort <span>&#9662;</span>
          </button>
          <div className="dropdown-content">
            {sortOptions.map(option => (
              <div
                key={option.value}
                className={`dropdown-item ${sortOption === option.value ? 'selected' : ''}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="reviews-list">
          {reviews.map((review) => (
            <li key={review.game_id} className="review-item">
              <div className="review-card">
                {/* Image container */}
                <div className="cover-image-container">
                  <img src={review.image_url} alt={`${review.game_name} cover`} className="cover-image" />
                </div>
                {/* Review content */}
                <div className="review-content">
                  <h3>{review.game_name}</h3>
                  <p>Rating: {review.rating}/10</p>
                  <p>{review.review_text}</p>
                </div>
                {/* Reviewed at section */}
                <div className="review-date">
                  <p>Reviewed at: {format(new Date(review.created_at), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{username} hasn't written any reviews yet.</p>
      )}
    </div>
  );
};

export default ProfileReviews;
