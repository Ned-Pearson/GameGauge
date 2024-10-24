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

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await API.get(`/reviews/user/${username}`);
        setReviews(response.data.reviews); 
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [username]);

  if (loading) {
    return <div className="reviews-page"><p>Loading reviews...</p></div>;
  }

  if (error) {
    return <div className="reviews-page"><p>Error loading reviews. Please try again later.</p></div>;
  }

  return (
    <div className="reviews-page">
      <h1>{username}'s Reviews</h1>
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
