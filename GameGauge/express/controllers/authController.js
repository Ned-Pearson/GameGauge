const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper function to generate Access Token
const generateAccessToken = (userId, username) => {
  return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
};

// Helper function to generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: '30d' }); // Long-lived refresh token
};

// Sign-Up Handler 
exports.signup = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if username already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    // Check if email already exists
    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    await db.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err); // Log the specific error
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Sign-In Handler 
exports.signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user[0].id, user[0].username); // Include username
    const refreshToken = generateRefreshToken(user[0].id);

    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user[0].id]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({ accessToken, message: 'Signed in successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Refresh Token Handler
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log('No refresh token provided');
    return res.status(403).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const [user] = await db.query('SELECT * FROM users WHERE id = ? AND refresh_token = ?', [decoded.userId, refreshToken]);

    if (!user.length) {
      console.log('Invalid refresh token');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(decoded.userId, user[0].username); // Include username
    console.log('New access token generated successfully'); // Log success message

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Invalid or expired refresh token', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout Handler 
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await db.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?', [refreshToken]);
  }

  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
};
