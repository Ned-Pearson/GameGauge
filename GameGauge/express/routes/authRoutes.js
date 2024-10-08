const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Helper function to generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username }, // Include username in the token payload
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper function to generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username }, // Include username in the token payload
    process.env.REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if email or username already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);

    if (existingUser.length > 0) {
      return res.json({ success: false, message: 'Email or username is already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await db.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

    return res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.json({ success: false, message: 'Signup failed. Please try again later.' });
  }
});

// Signin Route
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  console.log('Attempting to sign in:', { username });

  try {
    // Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user.length) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    // Compare the password
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate Access and Refresh Tokens with both userId and username
    const accessToken = generateAccessToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);


    // Store the refresh token in the database
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user[0].id]);

    // Send tokens; store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Securely store refresh token, not accessible by JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiry
    });

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).json({ success: false, message: 'Signin failed. Please try again later.' });
  }
});

// Verify Token Route
router.get('/verify-token', async (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ valid: false, message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'Malformed token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optionally, you can check if the user still exists in the database
    const [user] = await db.query('SELECT username FROM users WHERE id = ?', [decoded.userId]);

    if (!user.length) {
      return res.status(401).json({ valid: false, message: 'User does not exist.' });
    }

    return res.status(200).json({ valid: true, username: user[0].username });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ valid: false, message: 'Invalid or expired token.' });
  }
});

// Refresh Token Route
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  if (!refreshToken) {
    return res.status(403).json({ success: false, message: 'No refresh token provided.' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Fetch the user from the database using decoded.userId
    const [user] = await db.query('SELECT * FROM users WHERE id = ? AND refresh_token = ?', [decoded.userId, refreshToken]);

    if (!user.length) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
    }

    // Generate a new access token using the user object
    const newAccessToken = generateAccessToken(user[0]);

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error('Error during refresh token process:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken; // Safely access refreshToken

    if (refreshToken) {
      // Clear the refresh token from the database (if it's still valid)
      await db.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?', [refreshToken]);

      // Clear the refresh token cookie
      res.clearCookie('refreshToken');
    }

    // Clear the cookie whether token was valid or not (expired or missing)
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ success: false, message: 'Logout failed. Please try again later.' });
  }
});

module.exports = router;
