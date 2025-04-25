import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { PERSONALITY_TYPES } from '../types/user';

// Map MBTI types to our new personality types
const MBTI_TO_PERSONALITY_MAP = {
  'INTJ': 'ANALYTICAL',
  'INTP': 'ANALYTICAL',
  'ENTJ': 'LEADER',
  'ENTP': 'CREATIVE',
  'INFJ': 'COUNSELOR',
  'INFP': 'MEDIATOR',
  'ENFJ': 'LEADER',
  'ENFP': 'ENTERTAINER',
  'ISTJ': 'ANALYTICAL',
  'ISFJ': 'SUPPORTIVE',
  'ESTJ': 'LEADER',
  'ESFJ': 'SUPPORTIVE',
  'ISTP': 'ADVENTUROUS',
  'ISFP': 'CREATIVE',
  'ESTP': 'ADVENTUROUS',
  'ESFP': 'ENTERTAINER'
};

const normalizeUserData = (userData) => {
  // Convert MBTI type to new personality type if needed
  let normalizedPersonalityType = userData.personalityType || '';
  if (MBTI_TO_PERSONALITY_MAP[normalizedPersonalityType]) {
    normalizedPersonalityType = MBTI_TO_PERSONALITY_MAP[normalizedPersonalityType];
  } else if (!PERSONALITY_TYPES.includes(normalizedPersonalityType)) {
    normalizedPersonalityType = ''; // Reset invalid personality type
  }

  return {
    // Ensure all fields exist with proper types
    email: userData.email || '',
    displayName: userData.displayName || '',
    bio: userData.bio || '',
    interests: Array.isArray(userData.interests) 
      ? userData.interests 
      : (userData.interests || '').split(',').map(i => i.trim()).filter(i => i),
    location: userData.location || '',
    personalityType: normalizedPersonalityType,
    availability: Array.isArray(userData.availability) ? userData.availability : [],
    instagramHandle: (userData.instagramHandle || '').replace('@', ''),
    isAvailableForRent: Boolean(userData.isAvailableForRent),
    hourlyRate: typeof userData.hourlyRate === 'number' ? userData.hourlyRate : 0,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const migrateAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const migrations = [];
    let migratedCount = 0;
    let personalityTypeChanges = 0;
    
    snapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const normalizedData = normalizeUserData(userData);
      
      // Track personality type changes
      if (userData.personalityType !== normalizedData.personalityType) {
        personalityTypeChanges++;
        console.log(`Converting personality type for ${userData.email}: ${userData.personalityType} -> ${normalizedData.personalityType}`);
      }
      
      // Only update if there are differences
      if (JSON.stringify(userData) !== JSON.stringify(normalizedData)) {
        migrations.push(
          updateDoc(doc(db, 'users', userDoc.id), normalizedData)
        );
        migratedCount++;
      }
    });
    
    if (migrations.length > 0) {
      await Promise.all(migrations);
      console.log(`Successfully migrated ${migratedCount} user(s)`);
      console.log(`Converted ${personalityTypeChanges} personality type(s)`);
    } else {
      console.log('No migrations needed');
    }
    
    return {
      success: true,
      migratedCount,
      personalityTypeChanges
    };
  } catch (error) {
    console.error('Error during user data migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 