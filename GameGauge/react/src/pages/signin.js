import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import { AuthContext } from '../context/authContext';
import './signin.css'; 

function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Access the login function from AuthContext
  const { login } = useContext(AuthContext);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in:', { username });
      const response = await axios.post('http://localhost:5000/api/signin', 
        { username, password },
        { withCredentials: true } // Include cookies in the request
      );
      

      if (response.data.accessToken) {
        // Decode the JWT token to extract the username
        const decodedToken = jwtDecode(response.data.accessToken);
        const extractedUsername = decodedToken.username;

        // Use the login function from AuthContext
        login(response.data.accessToken, extractedUsername);

        // Redirect to the main page
        navigate('/'); 
      } else {
        console.log('Signin error:', response.data.message);
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
