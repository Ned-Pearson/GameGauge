const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getFollowers, getFollowing, getUsers, uploadProfilePic, getUserProfilePic, searchUsers, checkFollowStatus, getUserByUsername } = require('../controllers/usersController');
const multer = require('multer');
const path = require('path');

// Configure multer storage to retain the original file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Preserve the original extension
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Follow a user (authenticated)
router.post('/follow', authMiddleware, followUser);

// Unfollow a user (authenticated)
router.post('/unfollow', authMiddleware, unfollowUser);

// Get a list of followers for a specific user (public)
router.get('/:userId/followers', getFollowers);

// Get a list of users a specific user is following (public)
router.get('/:userId/following', getFollowing);

// Get all users (public)
router.get('/users', getUsers);

// Profile picture upload route with file deletion logic
router.post('/upload-profile-pic', authMiddleware, upload.single('profilePic'), uploadProfilePic);

// Get user profile picture by username (public)
router.get('/users/:username/profile-pic', getUserProfilePic);

router.get('/users/search', searchUsers);

// Check follow status
router.get('/users/:username/is-following', checkFollowStatus);

// Get user info by username
router.get('/users/:username', getUserByUsername);

module.exports = router;
