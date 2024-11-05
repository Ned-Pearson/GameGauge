import React, { useState, useEffect } from 'react';
import './homepage.css';
import { jwtDecode } from 'jwt-decode'; 
import { isAuthenticated } from '../utils/auth';
import API from '../utils/axios';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [popularGames, setPopularGames] = useState([]);
  const [popularWithFriends, setPopularWithFriends] = useState([]);
  const [friendActivity, setFriendActivity] = useState([]);

  useEffect(() => {
      // Fetch popular games regardless of user authentication
      API.get('/game/popular-games')
      .then(response => setPopularGames(response.data.popularGames))
      .catch(error => console.error('Error fetching popular games:', error));
  
    // Check if user is authenticated
    if (isAuthenticated()) {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.username);

      // Fetch friend activity if logged in
      API.get('/friend-activity')
        .then(response => setFriendActivity(response.data.friendActivity))
        .catch(error => console.error('Error fetching friend activity:', error));

      // Fetch popular with friends
      API.get('/popular-with-friends')
      .then(response => setPopularWithFriends(response.data.popularWithFriends))
      .catch(error => console.error('Error fetching popular with friends:', error));
    }
    }, []);

    return (
      <div className="homepage">
        <div className="welcome-section">
          {username ? (
            <>
              Welcome Back, {username}
              <div className="popular-text">Here’s what's popular on Game Gauge</div>
            </>
          ) : (
            <div className="login-prompt">
              Log in for full features
            </div>
          )}
        </div>
  
        <section className="section popular-week">
          <h2>Popular Recently</h2>
          <div className="game-grid">
            {popularGames.length ? (
              popularGames.slice(0, 5).map((game, idx) => ( // Limit to 5 items
                <div
                  key={idx}
                  className="game-card"
                  onClick={() => window.location.href = `/game/${game.game_id}`}
                >
                  <img src={game.image_url} alt={game.game_name} />
                  <div className="game-name">{game.game_name}</div>
                </div>
              ))
            ) : (
              <div>No popular games this week.</div>
            )}
          </div>
        </section>

        {username && (
          <section className="section new-from-friends">
            <h2>New From Friends</h2>
            <div className="game-grid">
              {friendActivity.length ? (
                friendActivity.slice(0, 5).map((activity, idx) => ( // Limit to 5 items
                  <div
                    key={idx}
                    className="game-card"
                    onClick={() => window.location.href = `/game/${activity.game_id}`}
                  >
                    <img src={activity.image_url} alt={activity.game_name} />
                    <div className="game-name">{activity.game_name}</div>
                    <div className="friend-activity-info">
                      <img
                        src={`http://localhost:5000/${activity.profile_pic ? activity.profile_pic : 'uploads/default-profile-icon.png'}`}
                        alt={activity.username}
                        className="friend-profile-pic"
                      />
                      {activity.reviewRating !== null ? (
                        <div className="activity-rating">
                          {activity.reviewRating}/10
                        </div>
                      ) : (
                        <div className="activity-review-indicator">
                          <span className="review-icon">≡</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div>No new activity from friends.</div>
              )}
            </div>
          </section>
        )}

        {username && (
          <section className="section popular-with-friends">
            <h2>Popular With Friends</h2>
            <div className="game-grid">
              {popularWithFriends.length ? (
                popularWithFriends.slice(0, 5).map((game, idx) => ( // Limit to 5 items
                  <div
                    key={idx}
                    className="game-card"
                    onClick={() => window.location.href = `/game/${game.game_id}`}
                  >
                    <img src={game.image_url} alt={game.game_name} />
                    <div className="game-name">{game.game_name}</div>
                  </div>
                ))
              ) : (
                <div>No popular games with friends this week.</div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  };
  
  export default HomePage;