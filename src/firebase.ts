import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable offline persistence so Firestore serves from local cache when the
// connection is slow or drops — prevents "client is offline" errors
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const googleProvider = new GoogleAuthProvider();

// Returns true when the app is embedded inside an iframe (e.g. Replit preview pane)
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

// Always use redirect — popup is blocked by Cross-Origin-Opener-Policy headers on the deployed site
// The iframe case is handled in the Navbar (Sign In ↗ opens a new tab first)
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Sign-in error:', error);
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
