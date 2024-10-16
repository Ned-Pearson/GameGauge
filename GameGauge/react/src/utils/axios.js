import axios from 'axios';
import { jwtDecode }from 'jwt-decode';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Allow cookies (for refresh token)
});

API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const tokenExpiration = decodedToken.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        // Attempt to refresh the token
        const response = await API.post('/refresh-token'); // Use API instance for consistent baseURL
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('token', newAccessToken);
        config.headers['Authorization'] = `Bearer ${newAccessToken}`;
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to decode token or refresh token:', error);
      // TODO, handle token refresh failure (e.g., redirect to login)
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
