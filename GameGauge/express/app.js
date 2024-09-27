require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');  // Import your auth routes

const app = express();

// Enable CORS to allow requests from the React app (modify the origin as needed)
app.use(cors({
  origin: 'http://localhost:3000'  // Modify this to match your frontend origin URL
}));

// Middleware
app.use(bodyParser.json());  // Parse incoming JSON requests

// Routes
app.use('/api', authRoutes);  // Use the auth routes for API

// Root route for health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
