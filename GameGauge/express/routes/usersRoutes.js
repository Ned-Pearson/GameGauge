const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getFollowers, getFollowing, getUsers } = require('../controllers/usersController');

// Follow a user (authenticated)
router.post('/follow', authMiddleware, followUser);

// Unfollow a user (authenticated)
router.post('/unfollow', authMiddleware, unfollowUser);

// Get a list of followers for a specific user (public)
router.get('/:userId/followers', getFollowers);

// Get a list of users a specific user is following (public)
router.get('/:userId/following', getFollowing);

router.get('/users', getUsers);

module.exports = router;
