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


function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
          <Routes>
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <Routes>
            <Route path="/signin" element={<Signin />} />
          </Routes>
          <Routes>
            <Route path="/search-results" element={<SearchResults />} />
          </Routes>
          <Routes>
            <Route path="/game/:id" element={<GamePage />} />
          </Routes>
          <Routes>
            <Route path="/users" element={<UsersPage />} />
          </Routes>
          <Routes>
            <Route path="/user/:username" element={<Profile />} />
          </Routes>
          <Routes>
            <Route path="/user/:username/reviews" element={<ProfileReviews />} />
          </Routes>
          
        </div>
        <Footer /> {/* Needs expansion */}
      </AuthProvider>
      </Router>
  );
}

export default App;
