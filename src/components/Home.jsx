import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-cyber-darker bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,246,255,0.15),rgba(0,0,0,0))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-20 pb-32 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="block cyber-gradient-text animate-pulse">
              RENT UNIQUE PERSONALITIES
            </span>
            <span className="block cyber-gradient-text mt-2">
              FOR REAL-LIFE MOMENTS
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-rajdhani"
          >
            Need someone fun for a party, a great study buddy, or a charismatic wingman? 
            Find or share personalities to match your vibe — hourly, flexible, and in your city.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button 
              onClick={handleFindMatch}
              className="cyber-button-primary"
            >
              FIND A PERSONALITY
            </button>
            <button 
              onClick={handleSharePersonality}
              className="cyber-button-secondary"
            >
              SHARE YOUR PERSONALITY
            </button>
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "CAMPUS PERSONALITIES",
                description: "Study group leaders, club presidents, and social butterflies — now just one click away.",
                icon: "🎓"
              },
              {
                title: "VERIFIED & SECURE",
                description: "Every profile is reviewed. Contact info is safe. Your experience is priority.",
                icon: "🔒"
              },
              {
                title: "RENT BY THE HOUR",
                description: "Only need someone for an event, meeting, or hangout? Rent for exactly when you need.",
                icon: "⏰"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="cyber-card"
              >
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{feature.icon}</div>
                <h3 className="text-xl font-bold text-cyber-neon mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 