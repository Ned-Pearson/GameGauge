import axios from 'axios';
import jwtDecode from 'jwt-decode';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Allow cookies (for refresh token)
});

API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');

  if (token) {
    const tokenExpiration = jwtDecode(token).exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      const response = await axios.post('/api/refresh-token');
      localStorage.setItem('token', response.data.accessToken);
      config.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
