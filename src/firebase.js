// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsOwFKjZEvqgO60OHEPUjX0X12AT1Z_lg",
  authDomain: "rentmypersonality.firebaseapp.com",
  projectId: "rentmypersonality",
  storageBucket: "rentmypersonality.firebasestorage.app",
  messagingSenderId: "412475846903",
  appId: "1:412475846903:web:337c487fcd75c04474e3f2"
};

let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication
  console.log('Initializing Firebase Auth...');
  auth = getAuth(app);

  // Set persistence to LOCAL
  console.log('Setting auth persistence...');
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Auth persistence set to LOCAL');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

  // Initialize Firestore
  console.log('Initializing Firestore...');
  db = getFirestore(app);

  // Initialize Storage
  console.log('Initializing Firebase Storage...');
  storage = getStorage(app);

  console.log('Firebase initialization complete');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Log the auth configuration for debugging
console.log("Firebase Auth Configuration:", {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

export { auth, db, storage };
