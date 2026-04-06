import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Anchor, LogOut, User as UserIcon, MessageSquare } from 'lucide-react';
import { auth, signInWithGoogle, logOut, db, getRedirectResult } from './firebase';
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Handle redirect sign-in result when returning from Google OAuth
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect result error:', err);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
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
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} profile={profile} setProfile={setProfile} />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/messages" element={<Messages user={user} profile={profile} />} />
            <Route path="/profile" element={<Profile user={user} profile={profile} setProfile={setProfile} />} />
          </Routes>
        </div>

        <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Anchor className="w-6 h-6 text-brand-500" />
              <span className="font-display font-bold text-xl text-slate-900">
                CHS Teen VolunHub
              </span>
            </div>
            <p className="text-slate-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Charleston Teen Volunteer Hub. Made for the Lowcountry.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
