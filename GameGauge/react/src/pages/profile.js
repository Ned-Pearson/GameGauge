import React, { useContext, useEffect, useState } from 'react';
import API from '../utils/axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import GameLog from '../components/gameLog';
import './profile.css';

const Profile = () => {
  const { username } = useParams();
  const { auth } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null); // Store profile user ID
  const [hoveredUser, setHoveredUser] = useState(null);


  const isOwner = auth?.username === username;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, logsResponse, followStatusResponse] = await Promise.all([
          API.get(`/users/${username}`), // Endpoint to get user details, including ID
          API.get(`/logs/user/${username}`),
          API.get(`/users/${username}/is-following`, { params: { followerId: auth?.id } })
        ]);

        setProfileUserId(profileResponse.data.id); // Set the profile user ID
        setProfilePic(profileResponse.data.profilePic);

        const logsWithReviews = await Promise.all(
          logsResponse.data.logs.map(async (log) => {
            try {
              const reviewResponse = await API.get(`/reviews/${log.game_id}/user/${username}`);
              return {
                ...log,
                rating: reviewResponse.data.review?.rating || null,
                review_text: reviewResponse.data.review?.review_text || null,
              };
            } catch (error) {
              if (error.response && error.response.status === 404) {
                return { ...log, rating: null, review_text: null };
              } else {
                console.error('Error fetching review:', error);
                throw error;
              }
            }
          })
        );

        setLogs(logsWithReviews);
        setIsFollowing(followStatusResponse.data.isFollowing);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, auth?.id]);

  const handleFollowToggle = async () => {
    if (!profileUserId) return; // Ensure profileUserId is loaded
    setFollowLoading(true);

    try {
      if (isFollowing) {
        await API.post(`/unfollow`, { userIdToUnfollow: profileUserId });
      } else {
        await API.post(`/follow`, { userIdToFollow: profileUserId });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const logSections = {
    completed: [],
    playing: [],
    wantToPlay: [],
    backlog: [],
    dropped: [],
  };

  logs.forEach((log) => {
    if (log.status === 'completed') logSections.completed.push(log);
    else if (log.status === 'playing') logSections.playing.push(log);
    else if (log.status === 'want to play') logSections.wantToPlay.push(log);
    else if (log.status === 'backlog') logSections.backlog.push(log);
    else if (log.status === 'dropped') logSections.dropped.push(log);
  });

  if (loading) return <div className="profile-page"><p>Loading logs...</p></div>;
  if (error) return <div className="profile-page"><p>Error loading logs. Please try again later.</p></div>;

  return (
    <div className="profile-page">
      <h1>{username}'s Profile</h1>
      {profilePic && (
        <img
          src={`http://localhost:5000/${profilePic}`}
          alt={`${username}'s profile`}
          className="profile-pic"
        />
      )}

      {isOwner ? (
        <Link to={`/user/${username}/edit-profile`} className="edit-profile-button">Edit Profile</Link>
      ) : (
        <button
          onClick={handleFollowToggle}
          onMouseEnter={() => {
            setHoveredUser(username);
          }}
          onMouseLeave={() => {
            setHoveredUser(null);
          }}          
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
        >
          {isFollowing
            ? hoveredUser === username ? 'X' : '✓'
            : `+`
          }
        </button>
        )}

        {!isOwner && hoveredUser === username && (
          <div className="hover-text">
            {isFollowing ? `Unfollow ${username}` : `Follow ${username}`}
          </div>
        )}
      

      <div className="status-navigation">
        <a href="#completed">Completed</a>
        <a href="#playing">Playing</a>
        <a href="#want-to-play">Want to Play</a>
        <a href="#backlog">Backlog</a>
        <a href="#dropped">Dropped</a>
      </div>

      {Object.entries(logSections).map(([status, games]) => (
        <section id={status} key={status}>
          <h2>{status.charAt(0).toUpperCase() + status.slice(1)} Games</h2>
          {games.length > 0 ? (
            <div className="logs-container">
              {games.map((log) => <GameLog key={log.game_id} log={log} />)}
            </div>
          ) : (
            <p>No games in this section.</p>
          )}
        </section>
      ))}

      <section id="reviews">
        <h2>{username}'s Reviews</h2>
        <p>Want to see all of {username}'s reviews?</p>
        <Link to={`/user/${username}/reviews`} className="view-reviews-button">View {username}'s Reviews</Link>
      </section>
    </div>
  );
};

export default Profile;
