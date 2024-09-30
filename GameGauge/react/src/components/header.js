import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import './header.css';

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  // Access auth state and logout function from authContext
  const { auth, logout } = useContext(AuthContext);
  
  const navigate = useNavigate();

  // Toggle the search bar
  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  // Toggle the profile dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    logout(); // Update the auth context
    navigate('/signin'); // Redirect to sign-in page after logout
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
          {/* Conditionally render Sign In / Sign Up or User dropdown */}
          {auth.username ? (
            <div 
              className="profile-section" 
              onMouseEnter={toggleDropdown} 
              onMouseLeave={toggleDropdown}
            >
              <img className="profile-pic" src="https://via.placeholder.com/30" alt="Profile" />
              <span className="username">{auth.username}</span>
              <span className="down-arrow">▼</span>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                                    <div className="dropdown-item">Profile</div>
                                    <div className="dropdown-item">Settings</div>
                  {/* Logout option */}
                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="nav-item">Sign In</Link>
              <Link to="/signup" className="nav-item">Sign Up</Link>
            </>
          )}

          {/* Navigation links */}
          <Link to="/games" className="nav-item">Games</Link>
          <Link to="/lists" className="nav-item">Lists</Link>
        </nav>

        {/* Search bar toggle */}
        <div className="search-container">
          {!isSearchOpen ? (
            <button className="search-btn" onClick={handleSearchToggle}>
              <i className="fas fa-search"></i>
            </button>
          ) : (
            <div className="search-bar">
              <input type="text" placeholder="Search..." />
              <button className="close-search-btn" onClick={handleSearchToggle}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        {/* Log button */}
        <button className="log-btn">+ LOG</button>
      </div>
    </header>
  );
}

export default Header;
