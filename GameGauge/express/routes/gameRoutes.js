const express = require('express');
const router = express.Router();
const { searchGames, getGameById  } = require('../controllers/gameController');

// Define the /search route
router.post('/search', searchGames);

router.post('/game', getGameById);

module.exports = router;
