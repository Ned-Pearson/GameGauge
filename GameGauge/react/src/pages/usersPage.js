import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/authContext';
import './usersPage.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const { auth } = useContext(AuthContext);

  // Decode token to get userId
  const userId = auth.token ? jwtDecode(auth.token).userId : null;

  useEffect(() => {
    const fetchUsersAndFollowing = async () => {
      try {
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data.users);

        // If user is logged in, fetch their following list
        if (userId) {
          const followingResponse = await axios.get(`http://localhost:5000/api/${userId}/following`);
          setFollowing(followingResponse.data.following.map(user => user.id));
        }
      } catch (error) {
        console.error('Error fetching users or following list:', error);
      }
    };

    fetchUsersAndFollowing();
  }, [userId]);

  const handleFollowToggle = async (targetUserId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };

      if (following.includes(targetUserId)) {
        await axios.post('http://localhost:5000/api/unfollow', { userIdToUnfollow: targetUserId }, config);
        setFollowing(following.filter(id => id !== targetUserId));
      } else {
        await axios.post('http://localhost:5000/api/follow', { userIdToFollow: targetUserId }, config);
        setFollowing([...following, targetUserId]);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  return (
    <div className="users-page">
      <h2>All Users</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <Link to={`/user/${user.username}`}>{user.username}</Link>
            {userId && user.id !== userId && (
              <button 
                onClick={() => handleFollowToggle(user.id)}
                className={`follow-btn ${following.includes(user.id) ? 'unfollow' : 'follow'}`}
              >
                {following.includes(user.id) ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersPage;
