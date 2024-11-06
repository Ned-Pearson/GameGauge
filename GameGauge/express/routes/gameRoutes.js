const express = require('express');
const router = express.Router();
const { searchGames, getGameById, getRatingStats, getPopularGames, getSimilarGames  } = require('../controllers/gameController');

// Define the /search route
router.post('/search', searchGames);

router.post('/game', getGameById);

router.get('/games/:gameId/ratings', getRatingStats);

router.get('/game/popular-games', getPopularGames);

router.get('/similar-games/:gameId', getSimilarGames);

module.exports = router;
