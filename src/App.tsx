import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Anchor, LogOut, User as UserIcon, MessageSquare, ChevronUp } from 'lucide-react';
import { auth, signInWithGoogle, logOut, db, getRedirectResult, isInIframe } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';

import Home from './components/Home';
import Organizations from './components/Organizations';
import CalendarView from './components/CalendarView';
import Profile from './components/Profile';
import Messages from './components/Messages';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  unreadCount: number;
}

function Navbar({ user, profile, unreadCount }: NavbarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-brand-500 text-white p-2 rounded-lg">
            <Anchor className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
            CHS Teen Volun<span className="text-brand-600">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6 font-medium text-sm text-slate-600">
          <Link to="/" className={`transition-colors ${isActive('/') ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>Opportunities</Link>
          <Link to="/organizations" className={`transition-colors ${isActive('/organizations') ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>Organizations</Link>
          <Link to="/calendar" className={`transition-colors ${isActive('/calendar') ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>Calendar</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/messages"
                className={`relative p-2 rounded-full transition-colors ${isActive('/messages') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-2 rounded-full text-sm font-medium transition-colors">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{profile?.name || 'Profile'}</span>
              </Link>
              <button onClick={logOut} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : isInIframe() ? (
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Sign In ↗
            </a>
          ) : (
            <button onClick={signInWithGoogle} className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const APP_VERSION = '1.0.3';

const CHANGELOG = [
  {
    version: '1.0.3',
    date: 'April 2026',
    changes: [
      'Enabled offline data caching — app works even with poor connectivity',
      'Fixed infinite loading spinner on slow connections',
    ],
  },
  {
    version: '1.0.2',
    date: 'April 2026',
    changes: [
      'Sign In button now opens a new tab when inside Replit preview',
      'Google popup sign-in works correctly on the deployed site',
    ],
  },
  {
    version: '1.0.1',
    date: 'April 2026',
    changes: [
      'Fixed Google sign-in popup disappearing',
      'Improved auth error messages',
    ],
  },
  {
    version: '1.0.0',
    date: 'April 2026',
    changes: [
      'In-app messaging between volunteers',
      'Favorite / save opportunities',
      'Google Calendar integration',
      'Real-time Firestore data sync',
      'User profiles with interests & hours tracking',
    ],
  },
];

function Footer() {
  const [showChangelog, setShowChangelog] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowChangelog(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Anchor className="w-6 h-6 text-brand-500" />
          <span className="font-display font-bold text-xl text-slate-900">
            CHS Teen VolunHub
          </span>
        </div>

        <p className="text-slate-500 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Charleston Teen Volunteer Hub. Made for the Lowcountry.
        </p>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setShowChangelog(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors border border-slate-200 hover:border-brand-300 px-3 py-1.5 rounded-full"
          >
            v{APP_VERSION}
            <ChevronUp className={`w-3 h-3 transition-transform ${showChangelog ? '' : 'rotate-180'}`} />
          </button>

          {showChangelog && (
            <div className="absolute bottom-10 right-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What's New</p>
              {CHANGELOG.map((entry, idx) => (
                <div key={entry.version} className={idx > 0 ? 'mt-4 pt-4 border-t border-slate-100' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">v{entry.version}</span>
                    <span className="text-xs text-slate-400">{entry.date}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-brand-500 font-bold mt-0.5">✓</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect sign-in result when returning from Google OAuth
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setAuthError(null);
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
        if (err.code === 'auth/unauthorized-domain') {
          setAuthError('This domain is not authorized in Firebase. Please add it under Firebase Console → Authentication → Settings → Authorized domains.');
        } else if (err.code) {
          setAuthError(`Sign-in failed: ${err.code}`);
        }
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Volunteer',
              email: currentUser.email || '',
              role: 'volunteer',
              completedHours: 0,
              interests: [],
              pastOrganizations: [],
              favorites: []
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          // Set a fallback profile so the app doesn't stay stuck on the spinner
          setProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Volunteer',
            email: currentUser.email || '',
            role: 'volunteer',
            completedHours: 0,
            interests: [],
            pastOrganizations: [],
            favorites: []
          });
        }
      } else {
        setProfile(null);
        setUnreadCount(0);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const total = snap.docs.reduce((sum, d) => {
        const data = d.data();
        return sum + (data.unreadCounts?.[user.uid] ?? 0);
      }, 0);
      setUnreadCount(total);
    }, (err) => console.error('Unread count error:', err));
    return () => unsub();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar user={user} profile={profile} unreadCount={unreadCount} />

        {authError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-center text-sm text-red-700 flex items-center justify-center gap-3">
            <span>{authError}</span>
            <button onClick={() => setAuthError(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} profile={profile} setProfile={setProfile} />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/messages" element={<Messages user={user} profile={profile} />} />
            <Route path="/profile" element={<Profile user={user} profile={profile} setProfile={setProfile} />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
