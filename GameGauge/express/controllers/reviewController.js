const db = require('../config/db');

// Create or update a review
const setReview = async (req, res) => {
    try {
      const { gameId, reviewText, rating, gameName, imageUrl } = req.body;
      const userId = req.user.userId; // Get userId from req.user
  
      // Logging all incoming data for debugging
      console.log('Incoming data:', { gameId, userId, reviewText, rating, gameName, imageUrl });
  
      // Ensure rating is either a number or set to null if not provided
      const reviewRating = rating !== undefined ? rating : null;
  
      // Check if any of the required variables are undefined
      if (gameId === undefined || userId === undefined || reviewText === undefined || gameName === undefined || imageUrl === undefined) {
        return res.status(400).json({ message: 'Game ID, User ID, review text, game name, and image URL are required.' });
      }
  
      const [result] = await db.execute(
        `INSERT INTO reviews (game_id, user_id, review_text, rating, game_name, image_URL) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE review_text = VALUES(review_text), rating = VALUES(rating), game_name = VALUES(game_name), image_URL = VALUES(image_URL)`,
        [gameId, userId, reviewText, reviewRating, gameName, imageUrl] 
      );

      res.status(200).json({ message: 'Review set successfully', result });
    } catch (error) {
      console.error('Error setting review:', error);
      res.status(500).json({ message: 'Error setting review', error });
    }
  };

// Get a user's review for a specific game
const getReview = async (req, res) => {
  const userId = req.user.userId;
  const { gameId } = req.params;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No review found for this game.' });
    }

    res.json({ review: rows[0] });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Failed to fetch review.' });
  }
};

// Delete a user's review for a specific game
const deleteReview = async (req, res) => {
  const userId = req.user.userId;
  const { gameId } = req.params;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM reviews WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.json({ message: 'Review removed successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review.' });
  }
};

// Get all reviews for a user
const getAllReviews = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      `SELECT game_id, game_name, image_url, review_text, rating, review_date 
       FROM reviews 
       WHERE user_id = ? 
       ORDER BY review_date DESC`,
      [userId]
    );

    res.json({ reviews: rows });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

// Get reviews by username
const getReviewsByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    // Get userId based on username
    const [userRows] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userId = userRows[0].id;

    // Get reviews for that userId
    const [userReviews] = await db.execute(
      'SELECT * FROM reviews WHERE user_id = ?',
      [userId]
    );

    if (userReviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this user.' });
    }

    res.json({ reviews: userReviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};

// Get review counts for a game
const getReviewCounts = async (req, res) => {
  const { gameId } = req.params;

  try {
    const [reviewCount] = await db.query(`
      SELECT COUNT(*) AS reviewCount
      FROM reviews
      WHERE game_Id = ?
    `, [gameId]);

    res.status(200).json({
      reviewCount: reviewCount[0].reviewCount,
    });
  } catch (err) {
    console.error('Error fetching review counts:', err);
    res.status(500).json({ error: 'Failed to fetch review counts' });
  }
};

module.exports = { setReview, getReview, deleteReview, getAllReviews, getReviewsByUsername, getReviewCounts };