const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  console.log('Attempting to sign up:', { username, email });

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

    // Create JWT token
    const token = jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send success response with token
    return res.json({ success: true, token });
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

    // Create JWT token
    const token = jwt.sign({ username, userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send success response with token
    return res.json({ success: true, token });
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).json({ success: false, message: 'Signin failed. Please try again later.' });
  }
});

module.exports = router;
