import React from 'react';
import { useLocation } from 'react-router-dom';
import './searchResults.css';

function SearchResults() {
  const location = useLocation();
  const searchResults = location.state?.results || [];
  const searchQuery = location.state?.query || '';

  return (
    <div className="search-results-page">
      <h1>Showing matches for "{searchQuery}"</h1>

      {searchResults.length === 0 ? (
        <p>No games found for your search.</p>
      ) : (
        <ul className="search-results-list">
          {searchResults.map((game) => (
            <li key={game.id} className="search-result-item">
              <div className="search-result-box">
                <img
                  src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/90x120'}
                  alt={game.name}
                  className="search-result-cover"
                />
                <div className="search-result-details">
                  <h2 className="game-title">{game.name}</h2>
                  <p className="game-release">
                    {new Date(game.first_release_date * 1000).getFullYear() || 'N/A'}
                  </p>
                  <p className="game-studio">
                    {game.involved_companies?.[0]?.company?.name || 'Unknown Studio'}
                  </p>
                  <p className="game-summary">
                    {game.summary ? `${game.summary}` : 'No summary available.'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchResults;