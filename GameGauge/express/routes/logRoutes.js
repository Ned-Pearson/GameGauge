// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setLogStatus, getLogStatus, deleteLogStatus, getAllLogs } = require('../controllers/logController');

// Protect routes with authentication middleware
router.post('/logs', authMiddleware, setLogStatus);
router.get('/logs/:gameId', authMiddleware, getLogStatus);
router.delete('/logs/:gameId', authMiddleware, deleteLogStatus);

router.get('/logs', authMiddleware, getAllLogs); // New route to get all logs

module.exports = router;
