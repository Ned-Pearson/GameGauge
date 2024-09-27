import { jwtDecode } from 'jwt-decode';

// Helper function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      
      // Check if the token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        // Token is expired
        return false;
      }

      // Token is valid
      return true;
    } catch (error) {
      // Invalid token
      return false;
    }
  }

  return false; // No token
};
