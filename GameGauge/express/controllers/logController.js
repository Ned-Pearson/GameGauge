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

module.exports = { setLogStatus, getLogStatus, deleteLogStatus };
