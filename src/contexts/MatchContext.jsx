import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const MatchContext = createContext();

export function useMatch() {
  return useContext(MatchContext);
}

export function MatchProvider({ children }) {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState([]);

  // Calculate compatibility score between two users
  const calculateMatchScore = (user1, user2) => {
    let score = 0;
    let totalFactors = 0;

    // Compare personality types (25% weight)
    if (user1.personalityType && user2.personalityType) {
      totalFactors++;
      if (user1.personalityType === user2.personalityType) {
        score += 25;
      }
    }

    // Compare availability (35% weight)
    if (user1.availability && user2.availability) {
      totalFactors++;
      const availabilityOverlap = user1.availability.filter(time => 
        user2.availability.includes(time)
      ).length;
      score += (availabilityOverlap / Math.max(user1.availability.length, user2.availability.length)) * 35;
    }

    // Compare bio keywords (40% weight)
    if (user1.bio && user2.bio) {
      totalFactors++;
      const bio1Words = user1.bio.toLowerCase().split(' ');
      const bio2Words = user2.bio.toLowerCase().split(' ');
      const commonWords = bio1Words.filter(word => bio2Words.includes(word)).length;
      score += (commonWords / Math.max(bio1Words.length, bio2Words.length)) * 40;
    }

    // Normalize score based on available factors
    return totalFactors > 0 ? (score / totalFactors) : 0;
  };

  // Check for matches with other users
  const checkForMatches = async (userData) => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    usersSnapshot.forEach(async (doc) => {
      const otherUser = doc.data();
      
      // Skip if it's the current user or if they've already matched
      if (doc.id === currentUser.uid || 
          matches.some(match => match.users.includes(doc.id))) {
        return;
      }

      const matchScore = calculateMatchScore(userData, otherUser);

      if (matchScore >= 50) {
        // Create a new match record
        const matchData = {
          users: [currentUser.uid, doc.id],
          score: matchScore,
          timestamp: new Date(),
          status: 'pending'
        };

        try {
          await addDoc(collection(db, 'matches'), matchData);
          
          // Show toast notification
          toast.success(`New match found! You matched with ${otherUser.displayName} (${matchScore.toFixed(0)}% compatibility)`, {
            duration: 5000,
            position: 'top-center',
            className: 'cyber-toast',
            icon: '🎯'
          });
        } catch (error) {
          console.error('Error creating match:', error);
        }
      }
    });
  };

  // Listen for new matches
  useEffect(() => {
    if (!currentUser) return;

    const matchesRef = collection(db, 'matches');
    const matchesQuery = query(
      matchesRef,
      where('users', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
      const newMatches = [];
      snapshot.forEach((doc) => {
        newMatches.push({ id: doc.id, ...doc.data() });
      });
      setMatches(newMatches);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    matches,
    checkForMatches
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
} 