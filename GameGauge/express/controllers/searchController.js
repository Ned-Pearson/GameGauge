const axios = require('axios');

let cachedAccessToken = null;
let tokenExpiryTime = null;  // Save the expiry time of the token

const getAccessToken = async () => {
  // If the token exists and hasn't expired, return it
  if (cachedAccessToken && tokenExpiryTime > Date.now()) {
    return cachedAccessToken;
  }

  // Otherwise, fetch a new token
  try {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
      params: {
        client_id: process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });

    cachedAccessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);  // Set expiry time (converts seconds to milliseconds)

    return cachedAccessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Failed to obtain IGDB access token');
  }
};

// Function to handle search requests
const searchGames = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // Obtain a valid access token
    const accessToken = await getAccessToken();
    console.log('Access Token:', accessToken);

    // Make a POST request to IGDB API
    const igdbResponse = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${query}"; fields id, name, cover.url, genres.name; limit 12;`,
      {
        headers: {
          'Client-ID': '6emwjyh3l2upcni50nw2vryt86uilb',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    res.json(igdbResponse.data);
  } catch (error) {
    console.error('Error fetching data from IGDB:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch data from IGDB.' });
  }
};

module.exports = { searchGames };
