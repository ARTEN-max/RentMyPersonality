import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        email: result.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayName: '',
        bio: '',
        interests: '',
        location: '',
        personalityType: '',
        availability: [],
        instagramHandle: ''
      });

      return result;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      return signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (user) {
        // Check if user document exists
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            displayName: '',
            bio: '',
            interests: '',
            location: '',
            personalityType: '',
            availability: [],
            instagramHandle: ''
          });
        }

        // Store minimal user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          uid: user.uid
        }));
      } else {
        localStorage.removeItem('user');
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 