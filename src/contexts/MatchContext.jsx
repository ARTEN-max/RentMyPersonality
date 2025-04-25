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
    
    // Only match if at least one user is available for rent
    if (!user1.isAvailableForRent && !user2.isAvailableForRent) {
      console.log('Neither user is available for rent');
      return 0;
    }

    let score = 0;
    let totalFactors = 0;

    console.log('Calculating match score between:', {
      user1: {
        displayName: user1.displayName,
        personalityType: user1.personalityType,
        interests: user1.interests,
        availability: user1.availability
      },
      user2: {
        displayName: user2.displayName,
        personalityType: user2.personalityType,
        interests: user2.interests,
        availability: user2.availability
      }
    });

    // Compare personality types (30% weight)
    if (user1.personalityType && user2.personalityType) {
      totalFactors++;
      if (user1.personalityType === user2.personalityType) {
        score += 30;
        console.log('Personality match:', user1.personalityType, '=', user2.personalityType, '(+30)');
      } else {
        // Give partial score for similar personality types
        const similarityScore = getSimilarityScore(user1.personalityType, user2.personalityType);
        const partialScore = similarityScore * 30;
        score += partialScore;
        console.log('Personality partial match:', user1.personalityType, 'vs', user2.personalityType, `(+${partialScore})`);
      }
    }

    // Compare availability (30% weight)
    if (user1.availability?.length && user2.availability?.length) {
      totalFactors++;
      const availabilityOverlap = user1.availability.filter(time => 
        user2.availability.includes(time)
      ).length;
      const maxAvailability = Math.max(user1.availability.length, user2.availability.length);
      const availabilityScore = (availabilityOverlap / maxAvailability) * 30;
      score += availabilityScore;
      console.log('Availability overlap:', availabilityOverlap, 'out of', maxAvailability, `(+${availabilityScore})`);
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
      const interestScore = (commonInterests / maxInterests) * 40;
      score += interestScore;
      console.log('Common interests:', commonInterests, 'out of', maxInterests, `(+${interestScore})`);
    }

    // Normalize score based on available factors
    const finalScore = totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 0;
    console.log('Final match score:', finalScore + '%');
    return finalScore;
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

    console.log('Checking for matches for user:', userData.displayName);

    try {
      // Get all users except current user
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '!=', currentUser.email));
      const querySnapshot = await getDocs(q);

      const newMatches = [];
      const matchThreshold = 50; // Lowered match threshold to 50%

      querySnapshot.forEach((doc) => {
        const otherUser = doc.data();
        console.log('Comparing with user:', otherUser.displayName);
        
        const matchScore = calculateMatchScore(userData, otherUser);

        if (matchScore >= matchThreshold) {
          newMatches.push({
            id: doc.id,
            ...otherUser,
            matchScore
          });

          // Send match notification
          const message = `New match found! You have a ${matchScore}% match with ${otherUser.displayName || 'someone'}${
            otherUser.isAvailableForRent ? ' (Available for rent)' : ' (Looking to rent)'
          }`;
          
          addToast(message, 'success');
          console.log('Match found:', message);
        }
      });

      // Update matches in state
      setMatches(newMatches);
      console.log('Total matches found:', newMatches.length);

      // Store matches in Firestore
      const matchesRef = collection(db, 'matches');
      newMatches.forEach(async (match) => {
        // Check if match already exists
        const existingMatchQuery = query(
          matchesRef,
          where('user1Id', '==', currentUser.uid),
          where('user2Id', '==', match.id)
        );
        const existingMatches = await getDocs(existingMatchQuery);

        if (existingMatches.empty) {
          const matchData = {
            user1Id: currentUser.uid,
            user2Id: match.id,
            matchScore: match.matchScore,
            timestamp: new Date().toISOString(),
            status: 'pending'
          };

          await addDoc(matchesRef, matchData);
          console.log('New match stored in database:', matchData);
        }
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

    console.log('Setting up match listener for user:', currentUser.email);

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