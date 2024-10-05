import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './searchResults.css';

function SearchResults() {
  const location = useLocation();
  const searchQuery = location.state?.query || '';
  const [searchResults, setSearchResults] = useState([]);
  const [limit, setLimit] = useState(12); // Start with an initial limit of 12
  const [loading, setLoading] = useState(false);

  // Function to fetch the results from the backend
  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/search', { query: searchQuery, limit });
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error fetching games:', error.response?.data || error.message);
    }
    setLoading(false);
  };

  // Fetch results when component mounts or the searchQuery or limit changes
  useEffect(() => {
    setLimit(12); // Reset the limit to initial value when a new search is made
    fetchResults();
  }, [searchQuery, limit]); // Re-fetch when searchQuery or limit changes

  // Handle "Show More" button click
  const handleShowMore = () => {
    setLimit((prevLimit) => prevLimit + 12); // Increase limit by 12
  };

  return (
    <div className="search-results-page">
      <h1 className="results-header">Showing matches for "{searchQuery}"</h1>

      {searchResults.length === 0 ? (
        <p>No games found for your search.</p>
      ) : (
        <>
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
                    <p className="game-release">{new Date(game.first_release_date * 1000).getFullYear() || 'N/A'}</p>
                    <p className="game-studio">{game.involved_companies?.[0]?.company?.name || 'Unknown Studio'}</p>
                    <p className="game-summary">{game.summary ? `${game.summary}` : 'No summary available.'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {/* Show More button */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <button onClick={handleShowMore} className="show-more-button">
              Show More Results
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;
