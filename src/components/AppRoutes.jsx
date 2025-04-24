import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import BrowsePersonalities from './BrowsePersonalities';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<BrowsePersonalities />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes; 