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
      `fields id, name, cover.url, genres.name, summary, involved_companies.company.name, first_release_date; 
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

    res.json({
      results: games,
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
      `fields name, summary, genres.name, platforms.name, first_release_date, involved_companies.company.name, cover.url, artworks.url; where id = ${gameId};`,
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

    res.json({ game: response.data[0] });
  } catch (error) {
    console.error('Error fetching game details from IGDB:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch game details from IGDB.' });
  }
};

const getRatingStats = async (req, res) => {
  const { gameId } = req.params; // Get gameId from the URL
  console.log('Received Game ID:', gameId); // Debugging log
  
  if (!gameId) {
    console.error('Game ID is required.'); // Debugging log
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  try {
    console.log('Querying ratings for game ID:', gameId); // Debugging log
    const [rows] = await db.query('SELECT rating FROM reviews WHERE game_id = ?', [gameId]);

    if (rows.length === 0) {
      console.log('No ratings found for game ID:', gameId); // Debugging log
      return res.json({ averageRating: 0, totalRatings: 0 }); // No ratings found
    }

    const ratings = rows.map(row => row.rating);
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;

    console.log('Calculated average rating:', averageRating, 'from', totalRatings, 'ratings.'); // Debugging log
    res.json({ averageRating: averageRating.toFixed(1), totalRatings });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ message: 'Failed to fetch rating stats.' });
  }
};

module.exports = { searchGames, getGameById, getRatingStats };