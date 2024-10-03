import React from 'react';
import { useLocation } from 'react-router-dom';
import './searchResults.css';

function SearchResults() {
  const location = useLocation();
  const searchResults = location.state?.results || [];
  const searchQuery = location.state?.query || '';

  return (
    <div className="search-results-page">
      <h1>Search Results for "{searchQuery}"</h1>

      {searchResults.length === 0 ? (
        <p>No games found for your search.</p>
      ) : (
        <ul className="search-results-list">
          {searchResults.map((game) => (
            <li key={game.id} className="search-result-item">
              <img
                src={game.cover ? `https:${game.cover.url}` : 'https://via.placeholder.com/50'}
                alt={game.name}
                className="search-result-cover"
              />
              <span>{game.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchResults;