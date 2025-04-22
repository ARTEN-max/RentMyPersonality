import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const userData = {
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastLogin: user.metadata.lastSignInTime
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUserDetails(userData);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      setUserDetails(null);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleFindMatch = () => {
    if (user) {
      navigate('/browse');
    } else {
      navigate('/auth');
    }
  };

  const handleSharePersonality = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-32 text-center">
          <h1 className="relative mb-8 pb-4">
            <span className="block text-7xl md:text-9xl font-black tracking-tighter mb-2 animate-pulse">
              <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text hover:scale-105 transform transition-transform cursor-default" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                BE ANYONE
              </span>
            </span>
            <span className="block text-6xl md:text-8xl font-bold tracking-wide">
              <span className="inline-block bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 text-transparent bg-clip-text hover:scale-105 transform transition-transform cursor-default" style={{ fontFamily: "'Audiowide', cursive" }}>
                YOU WANT TO BE
              </span>
            </span>
            {/* Decorative elements */}
            <div className="absolute -left-4 top-1/2 w-2 h-16 bg-cyan-500/50 blur-sm animate-pulse"></div>
            <div className="absolute -right-4 top-1/2 w-2 h-16 bg-purple-500/50 blur-sm animate-pulse delay-75"></div>
          </h1>
          
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto font-light tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Discover and rent unique personalities for any occasion. From charismatic speakers 
            to creative artists, find the perfect personality that matches your needs.
          </p>
          
          <div className="relative mb-12 max-w-2xl mx-auto overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl group-hover:opacity-75 transition-opacity"></div>
            <p className="relative text-lg text-cyan-400/90 font-medium tracking-wider" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              &lt; Built by Warriors, for Warriors /&gt;
              <br />
              <span className="text-sm text-cyan-400/70">
                Whether you need a study buddy for MC, a party personality for King Street,
                <br /> or a networking pro for your next Velocity pitch - we've got you covered.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={handleFindMatch}
              className="group relative px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 overflow-hidden"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative">FIND YOUR MATCH</span>
            </button>
            <button 
              onClick={handleSharePersonality}
              className="group relative px-8 py-4 rounded-lg bg-gray-800/80 text-cyan-400 font-bold text-lg transition-all border border-cyan-500/30 hover:bg-gray-700 hover:border-cyan-400 overflow-hidden"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative">&lt;SHARE PERSONALITY/&gt;</span>
            </button>
          </div>
        </div>

        {/* Features grid */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Campus Personalities",
                description: "From E7 study groups to Bomber Wednesdays - find the right personality for any UW moment",
                icon: "🎓"
              },
              {
                title: "Secure Platform",
                description: "Safe and verified personality rentals with secure payment system - as secure as PAC lockers",
                icon: "🔒"
              },
              {
                title: "Flexible Duration",
                description: "Rent personalities by the hour - perfect for your next tutorial or study session",
                icon: "⏰"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-cyan-500/10 border border-gray-700/50">
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{feature.icon}</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add font imports to index.html */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
        `}
      </style>
    </div>
  );
} 