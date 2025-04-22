import { db, storage } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const handleFirebaseError = (error) => {
  console.error('Firebase operation failed:', error);
  
  if (error.code) {
    // Handle specific Firebase errors
    switch (error.code) {
      case 'permission-denied':
        throw new Error('You do not have permission to perform this action. Please check if you are logged in.');
      case 'not-found':
        throw new Error('The requested document was not found.');
      case 'unauthenticated':
        throw new Error('You must be logged in to perform this action.');
      default:
        throw new Error(error.message || 'An error occurred while accessing the database.');
    }
  }
  
  throw error;
};

// Create or update a user profile
export const createUserProfile = async (userId, data) => {
  try {
    console.log('Creating/updating user profile for:', userId);
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('Profile created/updated successfully');
    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw new Error('Failed to create profile: ' + error.message);
  }
};

// Get a user's profile
export const getUserProfile = async (userId) => {
  try {
    console.log('Fetching user profile for:', userId);
    if (!userId) {
      throw new Error('No userId provided to getUserProfile');
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('Profile found:', data);
      return { id: userDoc.id, ...data };
    }
    console.log('No profile found for user:', userId);
    return null;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error('Failed to fetch profile: ' + error.message);
  }
};

// Update a user's profile
export const updateUserProfile = async (userId, data) => {
  try {
    console.log('Updating profile for:', userId, 'with data:', data);
    if (!userId) {
      throw new Error('No userId provided to updateUserProfile');
    }

    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      console.log('Profile does not exist, creating new profile');
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.log('Profile exists, updating existing profile');
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw new Error('Failed to update profile: ' + error.message);
  }
};

// Upload a profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('Uploading profile picture for:', userId);
    if (!userId || !file) {
      throw new Error('Both userId and file are required for uploadProfilePicture');
    }

    const storageRef = ref(storage, `profile-pictures/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update the user's profile with the new photo URL
    await updateUserProfile(userId, { photoURL: downloadURL });
    
    console.log('Profile picture uploaded successfully');
    return downloadURL;
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    throw new Error('Failed to upload profile picture: ' + error.message);
  }
};

// Get all available personalities (for browsing)
export const getAvailablePersonalities = async () => {
  try {
    console.log('Fetching available personalities');
    const q = query(
      collection(db, 'users'),
      where('isAvailableForRent', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const personalities = [];
    
    querySnapshot.forEach((doc) => {
      personalities.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Found', personalities.length, 'available personalities');
    return personalities;
  } catch (error) {
    console.error('Error in getAvailablePersonalities:', error);
    throw new Error('Failed to fetch available personalities: ' + error.message);
  }
};

export const getAllProfiles = async () => {
  try {
    console.log('Fetching all user profiles...');
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const profiles = [];
    querySnapshot.forEach((doc) => {
      profiles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${profiles.length} total profiles`);
    return profiles;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    throw new Error('Failed to fetch profiles: ' + (error.message || 'Unknown error'));
  }
}; 