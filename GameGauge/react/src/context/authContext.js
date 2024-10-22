import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
  });

  // Function to handle login
  const login = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setAuth({ token, username });
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth({ token: null, username: null });
  };

  // Optional: Verify token with backend on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (auth.token) {
        try {
          const response = await axios.get('http://localhost:5000/api/verify-token', {
            headers: { Authorization: `Bearer ${auth.token}` },
            withCredentials: true,
          });
          if (response.data.valid) {
            setAuth({ token: auth.token, username: response.data.username });
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed', error);
          logout(); 
        }
      }
    };
    // verifyToken(); //Commneted out for now as verify-token route is not implemented
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
