const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setLogStatus, getLogStatus, deleteLogStatus, getAllLogs, getLogsByUsername, getLogCounts } = require('../controllers/logController');

// Route for fetching logs by username (No authentication required)
router.get('/logs/user/:username', getLogsByUsername); 

// Protect routes with authentication middleware
router.post('/logs', authMiddleware, setLogStatus);
router.get('/logs/:gameId', authMiddleware, getLogStatus);
router.get('/logs/:gameId/counts', getLogCounts);
router.delete('/logs/:gameId', authMiddleware, deleteLogStatus);

router.get('/logs', authMiddleware, getAllLogs);

module.exports = router;
