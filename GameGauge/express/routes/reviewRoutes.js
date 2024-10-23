const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setReview, getReview, deleteReview, getAllReviews, getReviewsByUsername, getUserGameReview, getReviewCounts } = require('../controllers/reviewController');

// Route for fetching reviews by username (No authentication required)
router.get('/reviews/user/:username', getReviewsByUsername); 

// Protect routes with authentication middleware
router.post('/reviews', authMiddleware, setReview);
router.get('/reviews/:gameId', authMiddleware, getReview);
router.get('/reviews/:gameId/counts', getReviewCounts);
router.delete('/reviews/:gameId', authMiddleware, deleteReview);

router.get('/reviews', authMiddleware, getAllReviews);

router.get('/reviews/:gameId/user/:username', getUserGameReview);

module.exports = router;
