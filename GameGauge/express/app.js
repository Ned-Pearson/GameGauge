require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000' //Allow requests from local host react app 
    //Change this to the URL of your deployed React app
}));  // Enable CORS

// Middleware
app.use(bodyParser.json());  // To parse JSON bodies

// Routes
app.use('/api', authRoutes);


// Root route for health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
