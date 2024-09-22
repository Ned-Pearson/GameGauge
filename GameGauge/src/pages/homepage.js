import React from 'react';
import './homepage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Welcome Back, [Username]</h1>
        <p>Here’s whats popular this week</p>
      </header>

      <section className="section popular-week">
        <h2>Popular This Week</h2>
        <div className="game-grid">
          {/* Placeholder for content */}
          <div className="game-card">Game 1</div>
          <div className="game-card">Game 2</div>
          <div className="game-card">Game 3</div>
          <div className="game-card">Game 4</div>
          <div className="game-card">Game 5</div>
        </div>
      </section>

      <section className="section new-from-friends">
        <h2>New From Friends</h2>
        <div className="game-grid">
          {/* Placeholder for content */}
          <div className="game-card">Game A</div>
          <div className="game-card">Game B</div>
          <div className="game-card">Game C</div>
          <div className="game-card">Game D</div>
          <div className="game-card">Game E</div>
        </div>
      </section>

      <section className="section popular-with-friends">
        <h2>Popular With Friends</h2>
        <div className="game-grid">
          {/* Placeholder for content */}
          <div className="game-card">Game X</div>
          <div className="game-card">Game Y</div>
          <div className="game-card">Game Z</div>
          <div className="game-card">Game W</div>
          <div className="game-card">Game V</div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
