const express = require('express');
const router = express.Router();
const { searchGames, getGameById, getRatingStats, getPopularGames  } = require('../controllers/gameController');

// Define the /search route
router.post('/search', searchGames);

router.post('/game', getGameById);

router.get('/games/:gameId/ratings', getRatingStats);

router.get('/game/popular-games', getPopularGames);

module.exports = router;
