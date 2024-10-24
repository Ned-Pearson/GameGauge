import React, { useEffect, useState, useMemo } from 'react';
import API from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './profileReviews.css';
import { format } from 'date-fns';

const sortOptions = [
  { label: 'Newest to Oldest', value: 'newest' },
  { label: 'Oldest to Newest', value: 'oldest' },
  { label: 'Highest Rating', value: 'highest-rating' },
  { label: 'Lowest Rating', value: 'lowest-rating' },
];

const ProfileReviews = () => {
  const { username } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const navigate = useNavigate();

  // Fetch reviews on mount or when username changes
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setLoading(true); // Start loading when a fetch request is initiated
        const response = await API.get(`/reviews/user/${username}`);
        setReviews(response.data.reviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(true);
      } finally {
        setLoading(false); // Always stop loading regardless of success or failure
      }
    };

    fetchUserReviews();
  }, [username]);

  // Memoize sorted reviews to avoid unnecessary re-sorting on each render
  const sortedReviews = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return [...reviews].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'highest-rating':
        return [...reviews].sort((a, b) => b.rating - a.rating);
      case 'lowest-rating':
        return [...reviews].sort((a, b) => a.rating - b.rating);
      default:
        return reviews; // Newest by default since backend already sorts by 'newest'
    }
  }, [reviews, sortOption]);

  const handleCardClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Handle loading state early
  if (loading) {
    return <div className="reviews-page"><p>Loading reviews...</p></div>;
  }

  // Handle error state early
  if (error) {
    return <div className="reviews-page"><p>Error loading reviews. Please try again later.</p></div>;
  }

  return (
    <div className="reviews-page">
      <div className="sort-container">
        <div className="dropdown">
          <button className="dropdown-button">Sort ▼</button>
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

      <h1>{username}'s Reviews</h1>
      {sortedReviews.length > 0 ? (
        <ul className="reviews-list">
          {sortedReviews.map((review) => (
            <li key={review.game_id} className="review-item">
              <div className="review-card" onClick={() => handleCardClick(review.game_id)} style={{ cursor: 'pointer' }}>
                <div className="cover-image-container">
                  <img src={review.image_url} alt={`${review.game_name} cover`} className="cover-image" />
                </div>
                <div className="review-content">
                  <h3>{review.game_name}</h3>
                  <p>Rating: {review.rating}/10</p>
                  <p>{review.review_text}</p>
                </div>
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
