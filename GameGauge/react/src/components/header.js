import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Toggle the search bar
  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  // Toggle the profile dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
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
          {/* Profile dropdown */}
          <div 
            className="profile-section" 
            onMouseEnter={toggleDropdown} 
            onMouseLeave={toggleDropdown}
          >
            <img className="profile-pic" src="https://via.placeholder.com/30" alt="Profile" />
            <span className="username">Username</span>
            <span className="down-arrow">▼</span>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">Placeholder 1</div>
                <div className="dropdown-item">Placeholder 2</div>
                <div className="dropdown-item">Placeholder 3</div>
                <div className="dropdown-item">Placeholder 4</div>
                <div className="dropdown-item">Placeholder 5</div>
                <div className="dropdown-item">Placeholder 6</div>
              </div>
            )}
          </div>

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
