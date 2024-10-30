const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Follow a user
const followUser = async (req, res) => {
  const followerId = req.user.userId;
  const { userIdToFollow } = req.body;

  if (!userIdToFollow) {
    return res.status(400).json({ message: 'User ID to follow is required.' });
  }

  try {
    await db.execute(
      'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE follower_id = follower_id',
      [followerId, userIdToFollow]
    );

    res.status(200).json({ message: 'User followed successfully.' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Failed to follow user.' });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const followerId = req.user.userId;
  const { userIdToUnfollow } = req.body;

  if (!userIdToUnfollow) {
    return res.status(400).json({ message: 'User ID to unfollow is required.' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
      [followerId, userIdToUnfollow]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Follow relationship not found.' });
    }

    res.status(200).json({ message: 'User unfollowed successfully.' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Failed to unfollow user.' });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const [followers] = await db.execute(
      `SELECT users.id, users.username 
       FROM follows 
       JOIN users ON follows.follower_id = users.id 
       WHERE follows.followed_id = ?`,
      [userId]
    );

    res.json({ followers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Failed to fetch followers.' });
  }
};

// Get users a specific user is following
const getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const [following] = await db.execute(
      `SELECT users.id, users.username 
       FROM follows 
       JOIN users ON follows.followed_id = users.id 
       WHERE follows.follower_id = ?`,
      [userId]
    );

    res.json({ following });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Failed to fetch following list.' });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username FROM users ORDER BY username ASC'
    );
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// Profile picture upload with deletion of previous picture
const uploadProfilePic = async (req, res) => {
  const userId = req.user.userId;
  const newProfilePicPath = `uploads/${req.file.filename}`;

  try {
    // Retrieve the current profile picture path from the database
    const [rows] = await db.execute('SELECT profile_pic FROM users WHERE id = ?', [userId]);
    const currentProfilePicPath = rows[0].profile_pic;

    // Delete the existing profile picture file if it exists
    if (currentProfilePicPath && fs.existsSync(currentProfilePicPath)) {
      fs.unlinkSync(currentProfilePicPath);
    }

    // Update the user's profile picture path in the database
    await db.execute('UPDATE users SET profile_pic = ? WHERE id = ?', [newProfilePicPath, userId]);
    res.status(200).json({ message: 'Profile picture updated successfully.' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Failed to update profile picture.' });
  }
};

// Function to get a user's profile picture by their username
const getUserProfilePic = async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.execute('SELECT profile_pic FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const profilePicPath = rows[0].profile_pic;
    res.json({ profilePic: profilePicPath }); // Use the path as stored
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Failed to fetch profile picture.' });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUsers,
  uploadProfilePic,
  getUserProfilePic,
};