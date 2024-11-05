import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './searchResults.css';

function SearchResults() {
  const location = useLocation();
  const searchQuery = location.state?.query || '';
  const [searchResults, setSearchResults] = useState([]);
  const [limit, setLimit] = useState(12); // Start with an initial limit of 12
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false); // New state for fetching more results
  const [queryChanged, setQueryChanged] = useState(false); // New flag to detect if the query has changed

  // Function to fetch the results from the backend
  const fetchResults = async () => {
    setLoading(true); // Show loading indicator for initial search
    setIsFetchingMore(false); // Ensure this is false during normal loading
    try {
      const response = await axios.post('http://localhost:5000/api/search', { query: searchQuery, limit });
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error fetching games:', error.response?.data || error.message);
    }
    setLoading(false); // Hide loading indicator after fetching
  };

  // Listen for changes in searchQuery to reset the limit and trigger the queryChanged flag
  useEffect(() => {
    setLimit(12); // Reset the limit to the initial value when a new search is made
    setQueryChanged(true); // Set queryChanged flag to true
  }, [searchQuery]);

  // Fetch results when the limit changes (after resetting limit and when queryChanged is true)
  useEffect(() => {
    if (queryChanged) {
      setSearchResults([]); // Clear the old search results while loading new ones
      fetchResults(); // Fetch the new results
      setQueryChanged(false); // Reset the flag after fetching
    }
  }, [limit, queryChanged]);

  // Function to fetch more results (incremental loading)
  const fetchMoreResults = async () => {
    setIsFetchingMore(true); // Show loading indicator for fetching more
    try {
      const response = await axios.post('http://localhost:5000/api/search', { query: searchQuery, limit: limit + 12 });
      setSearchResults(response.data.results);
      setLimit((prevLimit) => prevLimit + 12); // Increase limit by 12
    } catch (error) {
      console.error('Error fetching more games:', error.response?.data || error.message);
    }
    setIsFetchingMore(false); // Hide loading indicator after fetching
  };

  return (
    <div className="search-results-page">
      <h1 className="results-header">Showing matches for "{searchQuery}"</h1>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading search results...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <p>No games found for your search.</p>
      ) : (
        <>
          <ul className="search-results-list">
            {searchResults.map((game) => (
              <li key={game.id} className="search-result-item">
                <Link to={`/game/${game.id}`} className="search-result-link">
                  <div className="search-result-box">
                    <img
                      src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : 'https://via.placeholder.com/90x120'}
                      alt={game.name}
                      className="search-result-cover"
                    />
                    <div className="search-result-details">
                      <h2 className="game-title">{game.name}</h2>
                      <p className="game-release">{new Date(game.first_release_date * 1000).getFullYear() || 'N/A'}</p>
                      
                      {/* Display developer name, which is now fetched from the API */}
                      <p className="game-studio">{game.developer}</p> 
                      
                      <p className="game-summary">{game.summary ? `${game.summary}` : 'No summary available.'}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Show More button and loader */}
          {isFetchingMore ? (
            <div className="loading-more-container">
              <div className="small-spinner"></div>
              <p>Loading more results...</p>
            </div>
          ) : (
            <button onClick={fetchMoreResults} className="show-more-button">
              Show More Results
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;
