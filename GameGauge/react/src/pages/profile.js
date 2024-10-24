import React, { useContext, useEffect, useState } from 'react';
import API from '../utils/axios';
import { useParams, Link } from 'react-router-dom'; // Import to get the dynamic URL param
import { AuthContext } from '../context/authContext';
import GameLog from '../components/gameLog';
import './profile.css'; 

const Profile = () => {
  const { username } = useParams(); // Get the username from the URL
  const { auth } = useContext(AuthContext); // Get authentication details
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch user's logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await API.get(`/logs/user/${username}`);
        const logsWithReviews = await Promise.all(
          response.data.logs.map(async (log) => {
            try {
              // Fetch the review for the specific game and user
              const reviewResponse = await API.get(`/reviews/${log.game_id}/user/${username}`);
              return {
                ...log,
                rating: reviewResponse.data.review?.rating || null, // Default to null if no rating
                review_text: reviewResponse.data.review?.review_text || null, // Default to null if no review
              };
            } catch (error) {
              // If review not found (404), handle it gracefully
              if (error.response && error.response.status === 404) {
                return {
                  ...log,
                  rating: null, // No rating
                  review_text: null, // No review
                };
              } else {
                console.error('Error fetching review:', error);
                throw error; // Handle other errors (e.g., server errors)
              }
            }
          })
        );
        setLogs(logsWithReviews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError(true);
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, [username]);    

  const isOwner = auth?.username === username; // Check if the logged-in user is the profile owner

  const logSections = {
    completed: [],
    playing: [],
    wantToPlay: [],
    backlog: [],
    dropped: [],
  };

  // Organize logs into sections based on status
  logs.forEach((log) => {
    if (log.status === 'completed') logSections.completed.push(log);
    else if (log.status === 'playing') logSections.playing.push(log);
    else if (log.status === 'want to play') logSections.wantToPlay.push(log);
    else if (log.status === 'backlog') logSections.backlog.push(log);
    else if (log.status === 'dropped') logSections.dropped.push(log);
  });

  if (loading) {
    return <div className="profile-page"><p>Loading logs...</p></div>;
  }

  if (error) {
    return <div className="profile-page"><p>Error loading logs. Please try again later.</p></div>;
  }

  return (
    <div className="profile-page">
      <h1>{username}'s Profile</h1>

      {/* Show "Edit Profile" button only if the logged-in user is viewing their own profile */}
      {isOwner && <button className="edit-profile-button">Edit Profile</button>} {/* Placeholder button */}

      <div className="status-navigation">
        <a href="#completed">Completed</a>
        <a href="#playing">Playing</a>
        <a href="#want-to-play">Want to Play</a>
        <a href="#backlog">Backlog</a>
        <a href="#dropped">Dropped</a>
      </div>

      {/* Completed Games */}
      <section id="completed">
        <h2>Completed Games</h2>
        {logSections.completed.length > 0 ? (
          <div className="logs-container">
            {logSections.completed.map((log) => (
              <GameLog key={log.game_id} log={log} />
            ))}
          </div>
        ) : (
          <p>No completed games yet.</p>
        )}
      </section>

      {/* Playing Games */}
      <section id="playing">
        <h2>Playing</h2>
        {logSections.playing.length > 0 ? (
          <div className="logs-container">
            {logSections.playing.map((log) => (
              <GameLog key={log.game_id} log={log} />
            ))}
          </div>
        ) : (
          <p>Not playing any games currently.</p>
        )}
      </section>

      {/* Want to Play Games */}
      <section id="want-to-play">
        <h2>Want to Play</h2>
        {logSections.wantToPlay.length > 0 ? (
          <div className="logs-container">
            {logSections.wantToPlay.map((log) => (
              <GameLog key={log.game_id} log={log} />
            ))}
          </div>
        ) : (
          <p>No games in the "Want to Play" list.</p>
        )}
      </section>

      {/* Backlog Games */}
      <section id="backlog">
        <h2>Backlog</h2>
        {logSections.backlog.length > 0 ? (
          <div className="logs-container">
            {logSections.backlog.map((log) => (
              <GameLog key={log.game_id} log={log} />
            ))}
          </div>
        ) : (
          <p>No games in the backlog.</p>
        )}
      </section>

      {/* Dropped Games */}
      <section id="dropped">
        <h2>Dropped</h2>
        {logSections.dropped.length > 0 ? (
          <div className="logs-container">
            {logSections.dropped.map((log) => (
              <GameLog key={log.game_id} log={log} />
            ))}
          </div>
        ) : (
          <p>No games dropped.</p>
        )}
      </section>
      {/* Reviews Button - Placeholder */}
      <section id="reviews">
        <h2>{username}'s Reviews</h2>
        <p>Want to see all of {username}'s reviews?</p>
        <Link to={`/user/${username}/reviews`} className="view-reviews-button">View {username}'s Reviews</Link>
      </section>
    </div>
  );
};

export default Profile;
