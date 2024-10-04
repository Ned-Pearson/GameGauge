const express = require('express');
const router = express.Router();
const { searchGames } = require('../controllers/searchController');

// Define the /search route
router.post('/search', searchGames);

module.exports = router;
