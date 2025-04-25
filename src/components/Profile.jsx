import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PERSONALITY_TYPES } from '../types/user';

const AVAILABILITY_SLOTS = [
  'Morning', 'Afternoon', 'Evening', 'Night',
  'Weekdays', 'Weekends', 'Flexible'
];

function Profile() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [location, setLocation] = useState('');
  const [personalityType, setPersonalityType] = useState('');
  const [availability, setAvailability] = useState([]);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isAvailableForRent, setIsAvailableForRent] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || '');
          setBio(userData.bio || '');
          setInterests(Array.isArray(userData.interests) ? userData.interests.join(', ') : userData.interests || '');
          setLocation(userData.location || '');
          setPersonalityType(userData.personalityType || '');
          setAvailability(userData.availability || []);
          setInstagramHandle(userData.instagramHandle || '');
          setIsAvailableForRent(userData.isAvailableForRent || false);
          setHourlyRate(userData.hourlyRate?.toString() || '');
        }
      } catch (error) {
        addToast('Failed to load profile data', 'error');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      addToast('Please log in to update your profile', 'error');
      navigate('/login');
      return;
    }

    if (!displayName.trim()) {
      addToast('Display name is required', 'error');
      return;
    }

    if (!personalityType) {
      addToast('Please select your personality type', 'error');
      return;
    }

    try {
      setSaving(true);
      const interestsArray = interests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);

      const userData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        interests: interestsArray,
        location: location.trim(),
        personalityType,
        availability,
        instagramHandle: instagramHandle.trim(),
        isAvailableForRent,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), userData);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = (slot) => {
    setAvailability(prev => 
      prev.includes(slot)
        ? prev.filter(item => item !== slot)
        : [...prev, slot]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-darker">
        <div className="text-cyber-neon animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-darker pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="cyber-card">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold cyber-gradient-text">
              Edit Your Profile
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {currentUser?.email}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-cyber-neon">
                  Display Name *
                </label>
                <input
                  id="display-name"
                  type="text"
                  required
                  className="cyber-input w-full"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="personality-type" className="block text-sm font-medium text-cyber-neon">
                  Personality Type *
                </label>
                <select
                  id="personality-type"
                  className="cyber-select w-full"
                  value={personalityType}
                  onChange={(e) => setPersonalityType(e.target.value)}
                  required
                >
                  <option value="">Select your personality type</option>
                  <option value="ANALYTICAL">ANALYTICAL - Logical, strategic, and intellectually curious</option>
                  <option value="CREATIVE">CREATIVE - Imaginative, artistic, and innovative</option>
                  <option value="LEADER">LEADER - Decisive, organized, and goal-oriented</option>
                  <option value="COUNSELOR">COUNSELOR - Empathetic, insightful, and supportive</option>
                  <option value="MEDIATOR">MEDIATOR - Harmonious, idealistic, and diplomatic</option>
                  <option value="ENTERTAINER">ENTERTAINER - Spontaneous, energetic, and outgoing</option>
                  <option value="SUPPORTIVE">SUPPORTIVE - Reliable, nurturing, and service-oriented</option>
                  <option value="ADVENTUROUS">ADVENTUROUS - Action-oriented, adaptable, and resourceful</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyber-neon mb-2">
                  Availability
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABILITY_SLOTS.map(slot => (
                    <label key={slot} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="cyber-checkbox"
                        checked={availability.includes(slot)}
                        onChange={() => handleAvailabilityChange(slot)}
                      />
                      <span className="ml-2 text-white">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyber-neon mb-2">
                    Available for Rent
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailableForRent}
                        onChange={(e) => setIsAvailableForRent(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {isAvailableForRent ? 'Available' : 'Not Available'}
                      </span>
                    </label>
                  </div>
                </div>

                {isAvailableForRent && (
                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-cyber-neon mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="cyber-input w-full"
                      placeholder="Enter your hourly rate"
                      required={isAvailableForRent}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-cyber-neon">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="cyber-input w-full"
                  placeholder="Where are you based?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-cyber-neon">
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    @
                  </span>
                  <input
                    id="instagram"
                    type="text"
                    className="cyber-input w-full pl-8"
                    placeholder="your.instagram.handle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-cyber-neon">
                  Interests
                </label>
                <input
                  id="interests"
                  type="text"
                  className="cyber-input w-full"
                  placeholder="What are your interests? (comma separated)"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  maxLength={200}
                />
                <p className="mt-1 text-sm text-gray-400">
                  Separate multiple interests with commas
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-cyber-neon">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="cyber-input w-full"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className={`w-full cyber-button ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile; 