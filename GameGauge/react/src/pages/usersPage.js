import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/authContext';
import './usersPage.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoveredSidebarUser, setHoveredSidebarUser] = useState(null);
  const { auth } = useContext(AuthContext);

  // Decode token to get userId
  const userId = auth.token ? jwtDecode(auth.token).userId : null;

  useEffect(() => {
    const fetchUsersAndRelations = async () => {
      try {
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data.users);

        // If user is logged in, fetch their following and followers list
        if (userId) {
          const followingResponse = await axios.get(`http://localhost:5000/api/${userId}/following`);
          setFollowing(followingResponse.data.following.map(user => user.id));

          const followersResponse = await axios.get(`http://localhost:5000/api/${userId}/followers`);
          setFollowers(followersResponse.data.followers);
        }
      } catch (error) {
        console.error('Error fetching users or relations:', error);
      }
    };

    fetchUsersAndRelations();
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
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <Link to={`/user/${user.username}`}>
              <div className="profile-picture-placeholder"></div>
            </Link>
            <div className="user-info">
              <Link to={`/user/${user.username}`} className="username">{user.username}</Link>
            </div>
            {userId && user.id !== userId && (
              <button
                onClick={() => handleFollowToggle(user.id)}
                onMouseEnter={() => setHoveredUser(user.username)}
                onMouseLeave={() => setHoveredUser(null)}
                className={`follow-btn ${following.includes(user.id) ? 'following' : ''}`}
              >
                {following.includes(user.id)
                  ? hoveredUser === user.username ? 'X' : '✓'
                  : `+`
                }
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="sidebar">
        <h3>Following</h3>
        <ul className="relation-list">
          {following.map(followedId => {
            const followedUser = users.find(user => user.id === followedId);
            return followedUser && (
              <li key={followedUser.id} className="relation-item">
                <Link to={`/user/${followedUser.username}`}>
                  <div
                    className="profile-picture-placeholder"
                    onMouseEnter={() => setHoveredSidebarUser(followedUser.username)}
                    onMouseLeave={() => setHoveredSidebarUser(null)}
                  ></div>
                </Link>
                {hoveredSidebarUser === followedUser.username && (
                  <span className="hover-username">{followedUser.username}</span>
                )}
              </li>
            );
          })}
        </ul>
        <h3>Followers</h3>
        <ul className="relation-list">
          {followers.map(follower => (
            <li key={follower.id} className="relation-item">
              <Link to={`/user/${follower.username}`}>
                <div
                  className="profile-picture-placeholder"
                  onMouseEnter={() => setHoveredSidebarUser(follower.username)}
                  onMouseLeave={() => setHoveredSidebarUser(null)}
                ></div>
              </Link>
              {hoveredSidebarUser === follower.username && (
                <span className="hover-username">{follower.username}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UsersPage;
