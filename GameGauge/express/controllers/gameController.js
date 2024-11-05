const axios = require('axios');
const db = require('../config/db');

let cachedAccessToken = null;
let tokenExpiryTime = null;

const getAccessToken = async () => {
  if (cachedAccessToken && tokenExpiryTime > Date.now()) {
    return cachedAccessToken;
  }

  try {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
      params: {
        client_id: process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });

    cachedAccessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);

    return cachedAccessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Failed to obtain IGDB access token');
  }
};

const searchGames = async (req, res) => {
  const { query, limit = 12 } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const accessToken = await getAccessToken();

    const igdbResponse = await axios.post(
      'https://api.igdb.com/v4/games',
      `fields id, name, cover.url, genres.name, summary, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, first_release_date; 
      search "${query}"; 
      where category = 0 & version_parent = null & parent_game = null; 
      limit ${limit};`, // Dynamically set the limit
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    const games = igdbResponse.data;

    // Format the games data to include only the first developer if they exist
    const formattedGames = games.map(game => {
      const developers = game.involved_companies && Array.isArray(game.involved_companies)
        ? game.involved_companies
            .filter(company => company.developer) // Filter for developers
            .map(company => company.company.name) // Extract the company names
        : [];

      // If you only want the first developer, you can do:
      const primaryDeveloper = developers.length > 0 ? developers[0] : 'Unknown Studio';

      return {
        ...game,
        developer: primaryDeveloper, // Include the primary developer in the game object
      };
    });

    res.json({
      results: formattedGames, // Return formatted games with developer
    });
  } catch (error) {
    console.error('Error fetching data from IGDB:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch data from IGDB.' });
  }
};

const getGameById = async (req, res) => {
  const { gameId } = req.body;
  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  try {
    const accessToken = await getAccessToken();  

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `fields name, summary, genres.name, platforms.name, first_release_date, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, cover.url, artworks.url; where id = ${gameId};`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    if (response.data.length === 0) {
      return res.status(404).json({ message: 'Game not found.' });
    }

    // Extract the game information
    const game = response.data[0];

    // Find the developer from the involved companies if they exist
    const developers = game.involved_companies && Array.isArray(game.involved_companies)
      ? game.involved_companies
          .filter(company => company.developer) // Filter for developers
          .map(company => company.company.name) // Extract the company names
      : [];

    // If you only want the first developer, you can do:
    const primaryDeveloper = developers.length > 0 ? developers[0] : 'Unknown Studio';

    // Include developer information in the response
    res.json({
      game: {
        ...game,
        developers: primaryDeveloper, 
      },
    });
  } catch (error) {
    console.error('Error fetching game details from IGDB:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch game details from IGDB.' });
  }
};

const getRatingStats = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Fetch ratings for the specific game
    const [rows] = await db.query('SELECT rating FROM reviews WHERE game_id = ?', [gameId]);

    console.log('Raw ratings from database:', rows); // Log the raw ratings for debugging

    // Extract ratings from the rows
    const validRatings = rows.map(row => row.rating).filter(rating => rating !== null);
    console.log('Filtered valid ratings:', validRatings); // Log filtered ratings

    const totalRatings = validRatings.length;

    // Calculate the sum of valid ratings
    const sumRatings = validRatings.reduce((acc, curr) => acc + (curr || 0), 0); // Default to 0 if curr is null

    // Calculate the average rating if totalRatings is not zero
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : '0.0'; // Return '0.0' if no ratings

    res.status(200).json({
      averageRating,
      totalRatings,
      individualRatings: validRatings, // Return filtered valid individual ratings
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPopularGames = async (req, res) => {
  try {
    const [popularGames] = await db.execute(`
      SELECT logs.game_id, logs.game_name, logs.image_url,
             COUNT(reviews.id) AS reviewCount,
             SUM(CASE WHEN logs.status IN ('completed', 'playing', 'want to play') THEN 1 ELSE 0 END) AS logCount
      FROM logs
      LEFT JOIN reviews ON reviews.game_id = logs.game_id
      WHERE logs.log_date >= NOW() - INTERVAL 1 WEEK
      GROUP BY logs.game_id, logs.game_name, logs.image_url
      ORDER BY (reviewCount + logCount) DESC
      LIMIT 5
    `);

    res.json({ popularGames });
  } catch (error) {
    console.error('Error fetching popular games:', error);
    res.status(500).json({ message: 'Failed to fetch popular games' });
  }
};

module.exports = { searchGames, getGameById, getRatingStats, getPopularGames };