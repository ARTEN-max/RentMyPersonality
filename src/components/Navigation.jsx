import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear all stored data
      localStorage.clear();
      sessionStorage.clear();
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Force a complete page reload to clear any cached states
      window.location.replace('/');
    } catch (error) {
      console.error('Failed to log out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                RentMyPersonality
              </span>
            </Link>
            {auth.currentUser && (
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Browse
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {auth.currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{auth.currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 