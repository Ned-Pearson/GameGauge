const express = require('express');
const router = express.Router();
const { searchGames, getGameById, getRatingStats  } = require('../controllers/gameController');

// Define the /search route
router.post('/search', searchGames);

router.post('/game', getGameById);

router.get('/games/:gameId/ratings', getRatingStats);

module.exports = router;
