import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFindMatch = () => {
    if (currentUser) {
      navigate('/browse');
    } else {
      navigate('/login');
    }
  };

  const handleSharePersonality = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-32 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              Rent Unique Personalities
            </span>
            <span className="block bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 text-transparent bg-clip-text mt-2">
              for Real-Life Moments
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Need someone fun for a party, a great study buddy, or a charismatic wingman? 
            Find or share personalities to match your vibe — hourly, flexible, and in your city.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={handleFindMatch}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
            >
              Find a Personality
            </button>
            <button 
              onClick={handleSharePersonality}
              className="px-8 py-4 rounded-lg bg-gray-800 text-cyan-400 font-bold text-lg border border-cyan-500/30 hover:bg-gray-700 hover:border-cyan-400 transition-all"
            >
              Share Your Personality
            </button>
          </div>
        </div>

        {/* Features grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Campus Personalities",
                description: "Study group leaders, club presidents, and social butterflies — now just one click away.",
                icon: "🎓"
              },
              {
                title: "Verified & Secure",
                description: "Every profile is reviewed. Contact info is safe. Your experience is priority.",
                icon: "🔒"
              },
              {
                title: "Rent by the Hour",
                description: "Only need someone for an event, meeting, or hangout? Rent for exactly when you need.",
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
    </div>
  );
} 