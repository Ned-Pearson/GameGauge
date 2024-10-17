import React, { useEffect, useState } from 'react';
import API from '../utils/axios'; 

const RatingChart = ({ gameId }) => {
  const [ratingData, setRatingData] = useState(null);
  const [error, setError] = useState('');

  const fetchRatingData = async () => {
    try {
      console.log('Fetching rating data for Game ID:', gameId); // Debugging log
      const response = await API.get(`/games/${gameId}/ratings`);
      console.log('Response received:', response.data); // Debugging log
      setRatingData(response.data);
    } catch (err) {
      console.error('Failed to fetch rating data:', err); // Debugging log
      setError('Failed to load rating data');
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchRatingData();
    } else {
      console.error('No Game ID provided.'); // Debugging log
    }
  }, [gameId]);

  if (error) {
    return <div>{error}</div>;
  }

  // Handle cases where there are no ratings or only one rating
  if (ratingData) {
    const { averageRating, totalRatings } = ratingData;

    console.log('Rating data:', ratingData); // Debugging log

    if (totalRatings === 0) {
      return <div>No ratings available for this game.</div>;
    }

    return (
      <div>
        <h3>Average Rating: {averageRating}</h3>
        <p>Total Ratings: {totalRatings}</p>
        {/* Add your chart rendering logic here (e.g., Chart.js) */}
      </div>
    );
  }

  return <p>Loading rating data...</p>;
};

export default RatingChart;
