const db = require('../config/db');

// Create or update a log entry
const setLogStatus = async (req, res) => {
  const userId = req.user.userId; 
  const { gameId, gameName, imageUrl, status } = req.body;

  if (!gameId || !status) {
    return res.status(400).json({ message: 'Game ID and status are required.' });
  }

  try {
    // Check if a log already exists
    const [rows] = await db.execute(
      'SELECT * FROM logs WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (rows.length > 0) {
      // Log exists, update it
      await db.execute(
        'UPDATE logs SET status = ?, log_date = CURRENT_TIMESTAMP WHERE user_id = ? AND game_id = ?',
        [status, userId, gameId]
      );
      res.json({ message: 'Log updated successfully.' });
    } else {
      // Log does not exist, insert new
      await db.execute(
        'INSERT INTO logs (user_id, game_id, game_name, image_url, status) VALUES (?, ?, ?, ?, ?)',
        [userId, gameId, gameName, imageUrl, status]
      );
      res.json({ message: 'Log created successfully.' });
    }
  } catch (error) {
    console.error('Error setting log status:', error);
    res.status(500).json({ message: 'Failed to set log status.' });
  }
};

// Get a user's log for a specific game
const getLogStatus = async (req, res) => {
    const userId = req.user.userId;
    const { gameId } = req.params;
  
    console.log('Fetching log status for User ID:', userId, 'Game ID:', gameId); // Debugging line
  
    if (!gameId) {
      return res.status(400).json({ message: 'Game ID is required.' });
    }
  
    try {
      const [rows] = await db.execute(
        'SELECT * FROM logs WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No log found for this game.' });
      }
  
      res.json({ log: rows[0] });
    } catch (error) {
      console.error('Error fetching log status:', error);
      res.status(500).json({ message: 'Failed to fetch log status.' });
    }
  };

// Delete a user's log for a specific game
const deleteLogStatus = async (req, res) => {
  const userId = req.user.userId;
  const { gameId } = req.params;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM logs WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Log not found.' });
    }

    res.json({ message: 'Log removed successfully.' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Failed to delete log.' });
  }
};

const getAllLogs = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      `SELECT game_id, game_name, image_url, status, log_date 
       FROM logs 
       WHERE user_id = ? 
       ORDER BY log_date DESC`,
      [userId]
    );

    res.json({ logs: rows });
  } catch (error) {
    console.error('Error fetching all logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs.' });
  }
};

const getLogsByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    // First, get the userId based on the username
    const [userRows] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userId = userRows[0].id; 

    // Now, get the logs for that userId
    const [userLogs] = await db.execute(
      'SELECT * FROM logs WHERE user_id = ?',
      [userId]
    );

    if (userLogs.length === 0) {
      return res.status(404).json({ message: 'No logs found for this user.' });
    }

    res.json({ logs: userLogs });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Error fetching logs.' });
  }
};

// Get log counts for a game
const getLogCounts = async (req, res) => {
  const { gameId } = req.params;
  
  try {
    // Count how many users have completed the game
    const [completedCount] = await db.query(`
      SELECT COUNT(*) AS completedCount
      FROM logs
      WHERE game_Id = ? AND status = 'Completed'
    `, [gameId]);

    // Count how many users are playing the game
    const [playingCount] = await db.query(`
      SELECT COUNT(*) AS playingCount
      FROM logs
      WHERE game_Id = ? AND status = 'Playing'
    `, [gameId]);

    // Send counts back to frontend
    res.status(200).json({
      completedCount: completedCount[0].completedCount,
      playingCount: playingCount[0].playingCount
    });
  } catch (err) {
    console.error('Error fetching log counts:', err);
    res.status(500).json({ error: 'Failed to fetch log counts' });
  }
};

module.exports = { setLogStatus, getLogStatus, deleteLogStatus, getAllLogs, getLogsByUsername, getLogCounts };
