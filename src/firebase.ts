import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Returns true when the app is embedded inside an iframe (e.g. Replit preview pane)
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export const signInWithGoogle = async () => {
  try {
    // Popup works in a normal browser tab (deployed site, new tab)
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      // Fallback to redirect when popup is blocked
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.error('Sign-in error:', error);
      throw error;
    }
  }
};

export { getRedirectResult };

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out', error);
  }
};
