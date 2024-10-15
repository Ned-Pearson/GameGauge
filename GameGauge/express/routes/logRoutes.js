// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setLogStatus, getLogStatus, deleteLogStatus, getAllLogs, getLogsByUsername } = require('../controllers/logController');

// Protect routes with authentication middleware
router.post('/logs', authMiddleware, setLogStatus);
router.get('/logs/:gameId', authMiddleware, getLogStatus);
router.delete('/logs/:gameId', authMiddleware, deleteLogStatus);

router.get('/logs/user/:username', (req, res, next) => {
    console.log('Request to fetch logs for:', req.params.username); // Add this to see if the request is reaching here
    next();
  }, getLogsByUsername);

router.get('/logs', authMiddleware, getAllLogs); // New route to get all logs

module.exports = router;
