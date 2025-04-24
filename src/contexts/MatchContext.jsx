import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const MatchContext = createContext();

export function useMatch() {
  return useContext(MatchContext);
}

export function MatchProvider({ children }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate compatibility score between two users
  const calculateMatchScore = (user1, user2) => {
    if (!user1 || !user2) return 0;
    let score = 0;
    let totalFactors = 0;

    // Compare personality types (30% weight)
    if (user1.personalityType && user2.personalityType) {
      totalFactors++;
      if (user1.personalityType === user2.personalityType) {
        score += 30;
      } else {
        // Give partial score for similar personality types
        const similarityScore = getSimilarityScore(user1.personalityType, user2.personalityType);
        score += similarityScore * 30;
      }
    }

    // Compare availability (30% weight)
    if (user1.availability?.length && user2.availability?.length) {
      totalFactors++;
      const availabilityOverlap = user1.availability.filter(time => 
        user2.availability.includes(time)
      ).length;
      const maxAvailability = Math.max(user1.availability.length, user2.availability.length);
      score += (availabilityOverlap / maxAvailability) * 30;
    }

    // Compare interests (40% weight)
    if (user1.interests?.length && user2.interests?.length) {
      totalFactors++;
      const interests1 = Array.isArray(user1.interests) ? user1.interests : [];
      const interests2 = Array.isArray(user2.interests) ? user2.interests : [];
      
      const commonInterests = interests1.filter(interest => 
        interests2.includes(interest)
      ).length;
      
      const maxInterests = Math.max(interests1.length, interests2.length);
      score += (commonInterests / maxInterests) * 40;
    }

    // Normalize score based on available factors
    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 0;
  };

  // Helper function to calculate similarity between personality types
  const getSimilarityScore = (type1, type2) => {
    if (type1 === type2) return 1;
    
    // Count matching letters in MBTI types
    const matchingLetters = type1.split('').filter((letter, index) => letter === type2[index]).length;
    return matchingLetters / 4; // Divide by 4 since MBTI has 4 letters
  };

  // Check for matches with other users
  const checkForMatches = async (userData) => {
    if (!currentUser || !userData) return;

    try {
      // Get all users except current user
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '!=', currentUser.email));
      const querySnapshot = await getDocs(q);

      const newMatches = [];
      const matchThreshold = 70; // Match score threshold (70%)

      querySnapshot.forEach((doc) => {
        const otherUser = doc.data();
        const matchScore = calculateMatchScore(userData, otherUser);

        if (matchScore >= matchThreshold) {
          newMatches.push({
            id: doc.id,
            ...otherUser,
            matchScore
          });

          // Send match notification
          addToast(`New match found! You have a ${matchScore}% match with ${otherUser.displayName || 'someone'}`, 'success');
        }
      });

      // Update matches in state
      setMatches(newMatches);

      // Store matches in Firestore
      const matchesRef = collection(db, 'matches');
      newMatches.forEach(async (match) => {
        const matchData = {
          user1Id: currentUser.uid,
          user2Id: match.id,
          matchScore: match.matchScore,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };

        await addDoc(matchesRef, matchData);
      });

    } catch (error) {
      console.error('Error checking for matches:', error);
      addToast('Failed to check for matches', 'error');
    }
  };

  // Listen for user profile updates
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        checkForMatches(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    matches,
    loading
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
} 