import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

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
      return createUserWithEmailAndPassword(auth, email, password);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Store minimal user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          uid: user.uid
        }));
      } else {
        localStorage.removeItem('user');
      }
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