// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  // Your web app's Firebase configuration
  // Replace these values with your actual Firebase config
  apiKey: "AIzaSyCzkMaz4LGbWfR8QhEcNFIVAFjJ3ZDMkaA",
  authDomain: "sports-app-4d03e.firebaseapp.com",
  projectId: "sports-app-4d03e",
  storageBucket: "sports-app-4d03e.firebasestorage.app",
  messagingSenderId: "522436405774",
  appId: "1:522436405774:web:e83f365063d986a1092a5f",
  measurementId: "G-GC8NXKLSTN"
};

// Log the Firebase config (without sensitive data)
console.log('Firebase initialized with project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with settings
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    }
  });
} catch (error) {
  console.error('Error enabling offline persistence:', error);
}

// Action Code Configuration for email link authentication
const actionCodeSettings = {
  // URL you want to redirect back to after email sign in
  url: window.location.origin + '/login',
  // This must be true for email link sign-in
  handleCodeInApp: true
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Email Link Authentication
export const signInWithEmailLinkAuth = async (email) => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email locally to complete sign in after clicking the email link
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Complete Email Link Sign In
export const completeEmailLinkSignIn = async (email, emailLink) => {
  try {
    if (isSignInWithEmailLink(auth, emailLink)) {
      let userEmail = email || window.localStorage.getItem('emailForSignIn');
      if (!userEmail) {
        // User opened the link on a different device
        userEmail = window.prompt('Please provide your email for confirmation');
      }
      const result = await signInWithEmailLink(auth, userEmail, emailLink);
      // Clear email from storage
      window.localStorage.removeItem('emailForSignIn');
      return { user: result.user, error: null };
    }
    return { user: null, error: 'Invalid sign-in link' };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Check Auth State
export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { auth, db };