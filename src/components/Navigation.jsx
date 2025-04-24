import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Navigation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear all stored data
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Force a complete page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to log out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  RentMyPersonality
                </span>
              </Link>
              
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Browse
                </Link>
                {user && (
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-400">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
} 