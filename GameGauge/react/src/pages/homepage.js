import React, { useState, useEffect } from 'react';
import './homepage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get the username from localStorage
    const storedUsername = localStorage.getItem('username');
    
    if (storedUsername) {
      setUsername(storedUsername); // Set the username if it exists
    } else {
      setUsername(''); // Clear the username if not available
    }
  }, []); // Empty dependency array ensures this runs only on component mount

  return (
    <div className="homepage">
      <div className="welcome-section">
        {username ? (
          <>
            Welcome Back, {username}
            <div className="popular-text">Here’s what's popular this week</div>
          </>
        ) : (
          <div className="login-prompt">
            Log in for full features
          </div>
        )}
      </div>

      <section className="section popular-week">
        <h2>Popular This Week</h2>
        <div className="game-grid">
          <div className="game-card">Game 1</div>
          <div className="game-card">Game 2</div>
          <div className="game-card">Game 3</div>
          <div className="game-card">Game 4</div>
          <div className="game-card">Game 5</div>
        </div>
      </section>

      {/* Conditionally show "New From Friends" if the user is logged in */}
      {username && (
        <section className="section new-from-friends">
          <h2>New From Friends</h2>
          <div className="game-grid">
            <div className="game-card">Game A</div>
            <div className="game-card">Game B</div>
            <div className="game-card">Game C</div>
            <div className="game-card">Game D</div>
            <div className="game-card">Game E</div>
          </div>
        </section>
      )}

      {/* Conditionally show "Popular With Friends" if the user is logged in */}
      {username && (
        <section className="section popular-with-friends">
          <h2>Popular With Friends</h2>
          <div className="game-grid">
            <div className="game-card">Game X</div>
            <div className="game-card">Game Y</div>
            <div className="game-card">Game Z</div>
            <div className="game-card">Game W</div>
            <div className="game-card">Game V</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
