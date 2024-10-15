import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchGames } from '../utils/searchGames'; 
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import './header.css';

function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim() === '') return; // Do nothing if search is empty
    const results = await searchGames(searchQuery);
    
    // Navigate to SearchResults page with results and query
    navigate('/search-results', { state: { results, query: searchQuery } });
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    logout();
    navigate('/signin');
  };

  return (
    <header className="header">
      {/* Left section with logo */}
      <div className="header-left">
        <div className="logo">
          <span className="logo-dot" style={{ backgroundColor: '#FF9933' }}></span>
          <span className="logo-dot" style={{ backgroundColor: '#66CC33' }}></span>
          <span className="logo-dot" style={{ backgroundColor: '#3399FF' }}></span>
          <Link to="/" className="logo-text">GameGauge</Link>
        </div>
      </div>

      {/* Right section with navigation */}
      <div className="header-right">
        <nav className="nav-links">
          {auth.username ? (
            <div 
              className="profile-section" 
              onMouseEnter={() => setDropdownOpen(true)} 
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <img className="profile-pic" src="https://via.placeholder.com/30" alt="Profile" />
              <span className="username">{auth.username}</span>
              <span className="down-arrow">▼</span>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to={`/${auth.username}`} className="dropdown-item">Profile</Link> {/* TODO Fix Styling */}
                  <div className="dropdown-item">Settings</div>
                  <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="nav-item">Sign In</Link>
              <Link to="/signup" className="nav-item">Sign Up</Link>
            </>
          )}
          <Link to="/games" className="nav-item">Games</Link>
          <Link to="/lists" className="nav-item">Lists</Link>
        </nav>

        {/* Search bar */}
        <div className="search-container">
          {!isSearchOpen ? (
            <button className="search-btn" onClick={handleSearchToggle}>
              <i className="fas fa-search"></i>
            </button>
          ) : (
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
              />
              <button className="search-submit-btn" onClick={handleSearchSubmit}>
                <i className="fas fa-search"></i>
              </button>
              <button className="close-search-btn" onClick={handleSearchToggle}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        <button className="log-btn">+ LOG</button>
      </div>
    </header>
  );
}

export default Header;
