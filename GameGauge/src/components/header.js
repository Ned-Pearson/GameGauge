// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; 

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-dot" style={{ backgroundColor: '#FF9933' }}></span>
          <span className="logo-dot" style={{ backgroundColor: '#66CC33' }}></span>
          <span className="logo-dot" style={{ backgroundColor: '#3399FF' }}></span>
          <Link to="/" className="logo-text">GameRate</Link>
        </div>
      </div>
      <div className="header-right">
        <nav>
          <Link to="/films">Games</Link>
          <Link to="/lists">Lists</Link>
          <button className="log-btn">+ LOG</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
