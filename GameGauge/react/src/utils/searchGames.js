import axios from 'axios';

export const searchGames = async (query) => {
  try {
    const response = await axios.post('http://localhost:5000/api/search', { query }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching games:', error.response?.data || error.message);
    return [];
  }
};
