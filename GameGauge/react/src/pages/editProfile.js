import React, { useState } from 'react';
import API from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      await API.post('/upload-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile picture uploaded successfully!');
      navigate(-1); // Go back to the Profile page
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default EditProfile;
