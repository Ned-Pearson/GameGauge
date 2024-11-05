import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homepage';
import Header from './components/header';
import Footer from './components/footer';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Signup from './pages/signup';
import Signin from './pages/signin';
import SearchResults from './pages/searchResults';
import { AuthProvider } from './context/authContext';
import GamePage from './pages/gamePage';
import Profile from './pages/profile';
import ProfileReviews from './pages/profileReviews';
import UsersPage from './pages/usersPage';
import EditProfile from './pages/editProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/user/:username" element={<Profile />} />
            <Route path="/user/:username/reviews" element={<ProfileReviews />} />
            <Route path="/user/:username/edit-profile" element={<EditProfile />} />
          </Routes>
        </div>
        <Footer /> {/* Needs expansion */}
      </AuthProvider>
    </Router>
  );
}

export default App;
