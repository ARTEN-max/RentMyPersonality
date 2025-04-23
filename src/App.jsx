import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Auth from './components/Auth';
import ProfilePage from './components/ProfilePage';
import BrowsePersonalities from './components/BrowsePersonalities';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/browse" element={<BrowsePersonalities />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


