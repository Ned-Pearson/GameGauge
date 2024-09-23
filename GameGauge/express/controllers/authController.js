const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Sign-Up Handler
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUser.length) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('password:', { password });
    console.log('hashed password:', { hashedPassword });

    // Insert new user into database
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Sign-In Handler
exports.signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the stored hash
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user[0].id);

    return res.status(200).json({ token, message: 'Signed in successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
