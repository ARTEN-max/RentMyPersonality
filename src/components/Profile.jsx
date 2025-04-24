import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PERSONALITY_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

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
  const [loading, setLoading] = useState(true);
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
          setInterests(userData.interests || '');
          setLocation(userData.location || '');
          setPersonalityType(userData.personalityType || '');
          setAvailability(userData.availability || []);
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
    
    if (!currentUser) return;

    try {
      setLoading(true);

      const userData = {
        displayName,
        bio,
        interests,
        location,
        personalityType,
        availability,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), userData);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
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
        <div className="text-cyber-neon">Loading...</div>
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
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  required
                  className="cyber-input w-full"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="personality-type" className="block text-sm font-medium text-cyber-neon">
                  Personality Type
                </label>
                <select
                  id="personality-type"
                  className="cyber-select w-full"
                  value={personalityType}
                  onChange={(e) => setPersonalityType(e.target.value)}
                  required
                >
                  <option value="">Select your MBTI type</option>
                  {PERSONALITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                />
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
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-cyber-neon">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows="4"
                  className="cyber-input w-full"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="cyber-button-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile; 