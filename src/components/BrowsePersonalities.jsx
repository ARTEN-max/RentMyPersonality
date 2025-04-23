import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllProfiles, getUserProfile } from '../services/userService';
import { PERSONALITY_TYPES } from '../types/user';

// Personality matching weights (can be adjusted)
const PERSONALITY_MATCH_SCORES = {
  'ANALYTICAL': {
    'ANALYTICAL': 1.0,
    'CREATIVE': 0.6,
    'LEADER': 0.8,
    'SUPPORTIVE': 0.7,
    'ADVENTUROUS': 0.5
  },
  'CREATIVE': {
    'ANALYTICAL': 0.6,
    'CREATIVE': 1.0,
    'LEADER': 0.7,
    'SUPPORTIVE': 0.8,
    'ADVENTUROUS': 0.9
  },
  'LEADER': {
    'ANALYTICAL': 0.8,
    'CREATIVE': 0.7,
    'LEADER': 1.0,
    'SUPPORTIVE': 0.9,
    'ADVENTUROUS': 0.8
  },
  'SUPPORTIVE': {
    'ANALYTICAL': 0.7,
    'CREATIVE': 0.8,
    'LEADER': 0.9,
    'SUPPORTIVE': 1.0,
    'ADVENTUROUS': 0.7
  },
  'ADVENTUROUS': {
    'ANALYTICAL': 0.5,
    'CREATIVE': 0.9,
    'LEADER': 0.8,
    'SUPPORTIVE': 0.7,
    'ADVENTUROUS': 1.0
  }
};

function ContactModal({ profile, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-cyan-500/30">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">Contact {profile.displayName}</h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Hourly Rate</p>
            <p className="text-lg font-semibold text-cyan-400">${profile.hourlyRate}</p>
          </div>
          <div>
            <p className="text-gray-400">Personality Type</p>
            <p className="text-lg font-semibold text-purple-400">{profile.personalityType}</p>
          </div>
          <div>
            <p className="text-gray-400">Bio</p>
            <p className="text-gray-300">{profile.bio}</p>
          </div>
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <p className="text-gray-400 mb-2">Contact Options</p>
            <div className="space-y-3">
              {profile.email && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-300">{profile.email}</p>
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${profile.email}?subject=Rent My Personality - Booking Request&body=Hi ${profile.displayName},%0D%0A%0D%0AI'm interested in booking your personality services.%0D%0A%0D%0ABest regards`;
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Send Email
                  </button>
                </div>
              )}
              {profile.instagramHandle && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-300">@{profile.instagramHandle}</p>
                  <a
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 text-sm inline-flex items-center space-x-2"
                  >
                    <span>Open Instagram</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePersonalities() {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  
  // Filter states
  const [selectedPersonalityType, setSelectedPersonalityType] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxHourlyRate, setMaxHourlyRate] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadProfiles();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.uid);
        setUserPreferences(userProfile);
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        setError('Please log in to browse personalities');
        return;
      }

      const allProfiles = await getAllProfiles();
      const otherProfiles = allProfiles.filter(profile => profile.id !== currentUser.uid);
      setProfiles(otherProfiles);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setError('Failed to load profiles: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (userType, profileType) => {
    if (!userType || !profileType) return 0;
    return PERSONALITY_MATCH_SCORES[userType]?.[profileType] || 0;
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleContactClick = (profile) => {
    setSelectedProfile(profile);
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
  };

  const filteredAndSortedProfiles = () => {
    return profiles
      .filter(profile => {
        if (selectedPersonalityType && profile.personalityType !== selectedPersonalityType) {
          return false;
        }
        if (onlyAvailable && !profile.isAvailableForRent) {
          return false;
        }
        if (maxHourlyRate && profile.hourlyRate > parseFloat(maxHourlyRate)) {
          return false;
        }
        return true;
      })
      .map(profile => ({
        ...profile,
        matchScore: calculateMatchScore(userPreferences?.personalityType, profile.personalityType)
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case 'match':
            return sortOrder === 'asc' ? a.matchScore - b.matchScore : b.matchScore - a.matchScore;
          case 'name':
            return sortOrder === 'asc' ? a.displayName.localeCompare(b.displayName) : b.displayName.localeCompare(a.displayName);
          case 'price':
            return sortOrder === 'asc' ? a.hourlyRate - b.hourlyRate : b.hourlyRate - a.hourlyRate;
          default:
            return 0;
        }
      });
  };

  const ProfileCard = ({ profile }) => {
    const { currentUser } = useAuth();
    const matchScore = calculateMatchScore(currentUser?.personalityType, profile.personalityType);

    return (
      <div className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Profile Picture Container */}
            <div className="relative flex-shrink-0">
              {/* Profile Picture */}
              {profile.photoURL ? (
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-25"></div>
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="relative w-16 h-16 rounded-full object-cover ring-2 ring-cyan-500/50"
                  />
                </div>
              ) : (
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-25"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-cyan-500/50">
                    <span className="text-2xl font-bold text-cyan-400">
                      {profile.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Match Score Badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full ring-2 ring-cyan-500 flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-400">{Math.round(matchScore * 100)}%</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent truncate">
                  {profile.displayName}
                </h3>
                <div className="flex-shrink-0 bg-gray-800/80 px-2 py-1 rounded-lg border border-cyan-500/30">
                  <span className="text-lg font-bold text-cyan-400">${profile.hourlyRate}/hr</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded-md bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 text-sm">
                  {profile.personalityType}
                </span>
                {profile.instagramHandle && (
                  <span className="text-sm text-gray-300">@{profile.instagramHandle}</span>
                )}
              </div>

              <div className="mt-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <p className="text-gray-300 line-clamp-2 text-sm">{profile.bio}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.isAvailableForRent
                    ? 'bg-green-900/70 text-green-300 border border-green-400/50'
                    : 'bg-red-900/70 text-red-300 border border-red-400/50'
                }`}>
                  {profile.isAvailableForRent ? 'Available' : 'Unavailable'}
                </div>

                <button
                  onClick={() => handleContactClick(profile)}
                  disabled={!profile.isAvailableForRent}
                  className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    profile.isAvailableForRent
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg hover:shadow-cyan-500/25'
                      : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {profile.isAvailableForRent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-50 transition-opacity duration-300 hover:opacity-75"></div>
                  )}
                  <span className="relative">Contact</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileListItem = ({ profile }) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-lg text-purple-600">
              {profile.displayName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{profile.displayName}</h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-purple-600">{profile.personalityType}</span>
            <span className="text-gray-500">
              • Match: {Math.round(profile.matchScore * 100)}%
            </span>
            <span className="text-gray-500">• ${profile.hourlyRate}/hr</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className={`px-3 py-1 rounded-full text-sm ${
          profile.isAvailableForRent
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {profile.isAvailableForRent ? 'Available' : 'Unavailable'}
        </div>
        <button
          onClick={() => handleContactClick(profile)}
          disabled={!profile.isAvailableForRent}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            profile.isAvailableForRent
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Contact
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Browse Personalities
          </h1>
          <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
        
        {error && (
          <div className="relative mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-red-500 rounded-lg blur opacity-20"></div>
            <div className="relative p-4 bg-red-900/50 border border-red-500/50 text-red-400 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="relative mb-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Personality Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personality Type
                </label>
                <select
                  value={selectedPersonalityType}
                  onChange={(e) => setSelectedPersonalityType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-cyan-500/20 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Types</option>
                  {PERSONALITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">Available Only</span>
                </label>
              </div>

              {/* Max Hourly Rate Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={maxHourlyRate}
                  onChange={(e) => setMaxHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-cyan-500/20 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  min="0"
                  step="0.01"
                  placeholder="No limit"
                />
              </div>

              {/* Sort Options */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-700/50 border border-cyan-500/20 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="match">Best Match</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-gray-700/50 border border-cyan-500/20 hover:bg-gray-600/50 text-cyan-400 rounded-lg transition-all duration-300"
                    aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Display */}
        <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2' : ''} gap-6`}>
          {filteredAndSortedProfiles().map(profile => (
            viewMode === 'grid' ? (
              <ProfileCard key={profile.id} profile={profile} />
            ) : (
              <ProfileListItem key={profile.id} profile={profile} />
            )
          ))}
        </div>

        {filteredAndSortedProfiles().length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No personalities found matching your criteria</p>
          </div>
        )}

        {selectedProfile && (
          <ContactModal
            profile={selectedProfile}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}