import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const normalizeUserData = (userData) => {
  return {
    // Ensure all fields exist with proper types
    email: userData.email || '',
    displayName: userData.displayName || '',
    bio: userData.bio || '',
    interests: Array.isArray(userData.interests) 
      ? userData.interests 
      : (userData.interests || '').split(',').map(i => i.trim()).filter(i => i),
    location: userData.location || '',
    personalityType: userData.personalityType || '',
    availability: Array.isArray(userData.availability) ? userData.availability : [],
    instagramHandle: (userData.instagramHandle || '').replace('@', ''),
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const migrateAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const migrations = [];
    
    snapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const normalizedData = normalizeUserData(userData);
      
      // Only update if there are differences
      if (JSON.stringify(userData) !== JSON.stringify(normalizedData)) {
        migrations.push(
          updateDoc(doc(db, 'users', userDoc.id), normalizedData)
        );
      }
    });
    
    if (migrations.length > 0) {
      await Promise.all(migrations);
      console.log(`Successfully migrated ${migrations.length} user(s)`);
    } else {
      console.log('No migrations needed');
    }
    
    return {
      success: true,
      migratedCount: migrations.length
    };
  } catch (error) {
    console.error('Error during user data migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 