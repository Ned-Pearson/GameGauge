const axios = require('axios');

// Function to obtain a new IGDB access token
// const getAccessToken = async () => {
//   try {
//     const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
//       params: {
//         client_id: process.env.IGDB_CLIENT_ID,
//         client_secret: process.env.IGDB_CLIENT_SECRET,
//         grant_type: 'client_credentials',
//       },
//     });
//     return response.data.access_token;
//   } catch (error) {
//     console.error('Error obtaining access token:', error.response?.data || error.message);
//     throw new Error('Failed to obtain IGDB access token.');
//   }
// };

const ACCESS_TOKEN = '6ind8louer031pmqiqg6espzjp8e8c';

// Function to handle search requests
const searchGames = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // Obtain a valid access token
    // const accessToken = await getAccessToken();
    const accessToken = ACCESS_TOKEN;

    // Make a POST request to IGDB API
    const igdbResponse = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${query}"; fields id, name, cover.url; limit 10;`,
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
