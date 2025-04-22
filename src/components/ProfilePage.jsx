import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../services/userService';
import { PERSONALITY_TYPES } from '../types/user';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [personalityType, setPersonalityType] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [isAvailableForRent, setIsAvailableForRent] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [instagramHandle, setInstagramHandle] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPersonalityType(profile.personalityType || '');
      setHourlyRate(profile.hourlyRate || 0);
      setIsAvailableForRent(profile.isAvailableForRent || false);
      setInstagramHandle(profile.instagramHandle || '');
    }
  }, [profile]);

  const loadProfile = async () => {
    console.log('Loading profile...');
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user found in auth.currentUser during profile load');
        setError('No user logged in');
        setLoading(false);
        return;
      }

      console.log('Fetching profile for user:', user.uid);
      const userProfile = await getUserProfile(user.uid);
      console.log('Fetched profile:', userProfile);
      
      if (!userProfile) {
        console.log('No existing profile found, creating default profile');
        const defaultProfile = {
          displayName: user.displayName || '',
          email: user.email,
          bio: '',
          personalityType: '',
          hourlyRate: 0,
          isAvailableForRent: false,
          photoURL: user.photoURL || null,
          rating: 0,
          totalRentals: 0,
          reviews: [],
          instagramHandle: ''
        };
        
        setDisplayName(defaultProfile.displayName);
        setBio(defaultProfile.bio);
        setPersonalityType(defaultProfile.personalityType);
        setHourlyRate(defaultProfile.hourlyRate);
        setIsAvailableForRent(defaultProfile.isAvailableForRent);
        setInstagramHandle(defaultProfile.instagramHandle);
        setProfile(defaultProfile);
      } else {
        console.log('Setting form states with existing profile data');
        setDisplayName(userProfile.displayName || '');
        setBio(userProfile.bio || '');
        setPersonalityType(userProfile.personalityType || '');
        setHourlyRate(userProfile.hourlyRate || 0);
        setIsAvailableForRent(userProfile.isAvailableForRent || false);
        setInstagramHandle(userProfile.instagramHandle || '');
        setProfile(userProfile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile: ' + (err.message || 'Unknown error'));
    } finally {
      console.log('Profile load complete, setting loading to false');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Starting profile update...');
      const user = auth.currentUser;
      if (!user) {
        console.error('No user found in auth.currentUser');
        setError('No user logged in');
        setLoading(false);
        return;
      }

      let updatedData = {
        displayName,
        bio,
        personalityType,
        hourlyRate: Number(hourlyRate),
        isAvailableForRent,
        instagramHandle,
      };

      // Handle profile picture upload if selected
      if (selectedFile) {
        console.log('Attempting to upload profile picture...');
        try {
          const photoURL = await uploadProfilePicture(user.uid, selectedFile);
          console.log('Profile picture uploaded successfully:', photoURL);
          if (photoURL) {
            updatedData.photoURL = photoURL;
          }
        } catch (uploadError) {
          console.error('Failed to upload profile picture:', uploadError);
          setError('Profile picture upload failed: ' + (uploadError.message || 'Unknown error'));
        }
      }

      // Only include photoURL in update if we're not changing it
      if (!selectedFile && profile?.photoURL) {
        updatedData.photoURL = profile.photoURL;
      }

      console.log('Updating profile with data:', updatedData);
      
      // Update profile
      await updateUserProfile(user.uid, updatedData);
      console.log('Profile updated successfully');

      // Clear the file input and selected file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      setSelectedFile(null);

      setSuccess('Profile updated successfully!' + (error ? ' (except profile picture)' : ''));
      setEditing(false);
      
      console.log('Reloading profile data...');
      await loadProfile();
      console.log('Profile data reloaded');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Please choose an image under 5MB.');
        return;
      }
      setSelectedFile(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-25"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-cyan-500/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
              Your Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div>
                <label className="block text-lg font-medium text-cyan-400 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profile?.photoURL ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-sm opacity-50"></div>
                        <img
                          src={profile.photoURL}
                          alt="Profile"
                          className="relative h-24 w-24 rounded-full object-cover ring-2 ring-cyan-500 z-10"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-sm opacity-50"></div>
                        <div className="relative h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-cyan-500 z-10">
                          <span className="text-3xl font-bold text-cyan-400">
                            {profile?.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-cyan-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-900/50 file:text-cyan-400 hover:file:bg-cyan-800/50 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>

              {/* Display Name Input */}
              <div>
                <label htmlFor="displayName" className="block text-lg font-medium text-cyan-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-cyan-100 placeholder-cyan-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all"
                  placeholder="Enter your display name"
                />
              </div>

              {/* Personality Type Select */}
              <div>
                <label htmlFor="personalityType" className="block text-lg font-medium text-cyan-400 mb-2">
                  Personality Type
                </label>
                <select
                  id="personalityType"
                  name="personalityType"
                  value={personalityType}
                  onChange={(e) => setPersonalityType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-cyan-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all"
                >
                  <option value="" disabled className="bg-gray-900 text-cyan-400">Select a personality type</option>
                  {PERSONALITY_TYPES.map(type => (
                    <option key={type} value={type} className="bg-gray-900 text-cyan-100">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio Textarea */}
              <div>
                <label htmlFor="bio" className="block text-lg font-medium text-cyan-400 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-cyan-100 placeholder-cyan-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Instagram Handle Input */}
              <div>
                <label htmlFor="instagramHandle" className="block text-lg font-medium text-cyan-400 mb-2">
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cyan-400">@</span>
                  <input
                    type="text"
                    id="instagramHandle"
                    name="instagramHandle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-cyan-100 placeholder-cyan-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all"
                    placeholder="your.instagram.handle"
                  />
                </div>
              </div>

              {/* Hourly Rate Input */}
              <div>
                <label htmlFor="hourlyRate" className="block text-lg font-medium text-cyan-400 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-cyan-100 placeholder-cyan-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all"
                  placeholder="Enter your hourly rate"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="isAvailableForRent" className="text-lg font-medium text-cyan-400">
                  Available for Rent
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isAvailableForRent"
                    name="isAvailableForRent"
                    checked={isAvailableForRent}
                    onChange={(e) => setIsAvailableForRent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {error && (
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-red-500 blur opacity-20"></div>
                  <div className="relative p-4 bg-red-900/50 border border-red-500/50 text-red-400">
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-green-500 blur opacity-20"></div>
                  <div className="relative p-4 bg-green-900/50 border border-green-500/50 text-green-400">
                    {success}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 rounded-lg bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-all border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-medium transition-all hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-50"></div>
                      <span className="relative">Updating...</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-50"></div>
                      <span className="relative">Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 