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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { auth } = useContext(AuthContext);

  // Decode token to get userId
  const userId = auth.token ? jwtDecode(auth.token).userId : null;

  useEffect(() => {
    const fetchUsersAndRelations = async () => {
      try {
        // Fetch all users with profile pictures
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        const usersWithPics = await Promise.all(
          usersResponse.data.users.map(async (user) => {
            try {
              const profilePicResponse = await axios.get(`http://localhost:5000/api/users/${user.username}/profile-pic`);
              return { ...user, profilePic: profilePicResponse.data.profilePic };
            } catch {
              return user;
            }
          })
        );
        setUsers(usersWithPics);

        // If user is logged in, fetch their following and followers list
        if (userId) {
          const followingResponse = await axios.get(`http://localhost:5000/api/${userId}/following`);
          const followingWithPics = await Promise.all(
            followingResponse.data.following.map(async (user) => {
              try {
                const profilePicResponse = await axios.get(`http://localhost:5000/api/users/${user.username}/profile-pic`);
                return { ...user, profilePic: profilePicResponse.data.profilePic };
              } catch {
                return user;
              }
            })
          );
          setFollowing(followingWithPics);

          const followersResponse = await axios.get(`http://localhost:5000/api/${userId}/followers`);
          const followersWithPics = await Promise.all(
            followersResponse.data.followers.map(async (user) => {
              try {
                const profilePicResponse = await axios.get(`http://localhost:5000/api/users/${user.username}/profile-pic`);
                return { ...user, profilePic: profilePicResponse.data.profilePic };
              } catch {
                return user;
              }
            })
          );
          setFollowers(followersWithPics);
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

      if (following.some(user => user.id === targetUserId)) {
        await axios.post('http://localhost:5000/api/unfollow', { userIdToUnfollow: targetUserId }, config);
        setFollowing(following.filter(user => user.id !== targetUserId));
      } else {
        await axios.post('http://localhost:5000/api/follow', { userIdToFollow: targetUserId }, config);
        setFollowing([...following, { id: targetUserId }]);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  
    if (query.trim()) {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/search`, {
          params: { username: query },
        });
        const resultsWithPics = await Promise.all(
          response.data.users.map(async (user) => {
            try {
              const profilePicResponse = await axios.get(`http://localhost:5000/api/users/${user.username}/profile-pic`);
              return { ...user, profilePic: profilePicResponse.data.profilePic };
            } catch {
              return user;
            }
          })
        );
        setSearchResults(resultsWithPics);
      } catch (error) {
        console.error('Error during search:', error);
      }
    } else {
      setSearchResults([]);
    }
  };  

  return (
    <div className="users-page">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />
  
      <ul className="user-list">
        {(searchQuery ? searchResults : users).map((user) => (
          <li key={user.id} className="user-item">
            <Link to={`/user/${user.username}`}>
              <img
                className="profile-picture-placeholder"
                src={user.profilePic ? `http://localhost:5000/${user.profilePic.replace(/\\/g, '/')}` : "https://via.placeholder.com/30"}
                alt={`${user.username}'s profile`}
              />
            </Link>
            <div className="user-info">
              <Link to={`/user/${user.username}`} className="username">{user.username}</Link>
            </div>
            {userId && user.id !== userId && (
              <div className="follow-button-container">
                <button
                  onClick={() => handleFollowToggle(user.id)}
                  onMouseEnter={() => setHoveredUser(user.username)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className={`follow-btn ${following.some(u => u.id === user.id) ? 'following' : ''}`}
                >
                  {following.some(u => u.id === user.id)
                    ? hoveredUser === user.username ? 'X' : '✓'
                    : `+`
                  }
                </button>
                {hoveredUser === user.username && (
                  <span className="hover-text">
                    {following.some(u => u.id === user.id) ? `Unfollow ${user.username}` : `Follow ${user.username}`}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
  
      {/* Conditionally display "Following" and "Followers" sections if user is logged in */}
      {userId && (
        <div className="sidebar">
          <h3>Following</h3>
          <ul className="relation-list">
            {following.map(followedUser => (
              <li key={followedUser.id} className="relation-item">
                <Link to={`/user/${followedUser.username}`}>
                  <img
                    className="profile-picture-placeholder"
                    src={followedUser.profilePic ? `http://localhost:5000/${followedUser.profilePic.replace(/\\/g, '/')}` : "https://via.placeholder.com/30"}
                    alt={`${followedUser.username}'s profile`}
                    onMouseEnter={() => setHoveredSidebarUser(followedUser.username)}
                    onMouseLeave={() => setHoveredSidebarUser(null)}
                  />
                </Link>
              </li>
            ))}
          </ul>
  
          <h3>Followers</h3>
          <ul className="relation-list">
            {followers.map(follower => (
              <li key={follower.id} className="relation-item">
                <Link to={`/user/${follower.username}`}>
                  <img
                    className="profile-picture-placeholder"
                    src={follower.profilePic ? `http://localhost:5000/${follower.profilePic.replace(/\\/g, '/')}` : "https://via.placeholder.com/30"}
                    alt={`${follower.username}'s profile`}
                    onMouseEnter={() => setHoveredSidebarUser(follower.username)}
                    onMouseLeave={() => setHoveredSidebarUser(null)}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );  
}  

export default UsersPage;
