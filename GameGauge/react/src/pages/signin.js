import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import { isAuthenticated } from '../utils/auth'; 
import './signin.css'; 

function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/signin', { username, password });

      if (response.data.token) {
        // Store JWT token and username in localStorage
        localStorage.setItem('token', response.data.token);

        const decodedToken = jwtDecode(response.data.token);
        localStorage.setItem('username', decodedToken.username); //Not necessary but keeping for potential debugging

        // After successful sign-in, check authentication status using the helper
        if (isAuthenticated()) {
          navigate('/'); // Redirect to the main page if authenticated
        } else {
          setError('Session expired. Please sign in again.');
        }
      } else {
        setError(response.data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Signin error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during signin. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSignin} className="signin-form">
        <h2>Sign In</h2>

        {error && <p className="error-message">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="signup-link-container">
          <p>Don't have an account?</p>
          <a href="/signup">Sign Up</a>
        </div>
      </form>
    </div>
  );
}

export default Signin;
