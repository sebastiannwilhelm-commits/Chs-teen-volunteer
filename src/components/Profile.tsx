import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Award, Clock, Heart, Edit3, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_OPPORTUNITIES } from '../mockData';

interface ProfileProps {
  user: User | null;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const INTEREST_OPTIONS = ['Environment', 'Animals', 'Community', 'Education', 'Health', 'Arts', 'Sports'];

export default function Profile({ user, profile, setProfile }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editInterests, setEditInterests] = useState<string[]>(profile?.interests || []);

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to view your profile</h2>
        <p className="text-slate-600">Track your hours, manage interests, and see your impact.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editName,
        interests: editInterests
      });
      setProfile({ ...profile, name: editName, interests: editInterests });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const toggleInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(editInterests.filter(i => i !== interest));
    } else {
      if (editInterests.length < 5) {
        setEditInterests([...editInterests, interest]);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-brand-500 to-cyan-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-brand-600">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        <div className="pt-16 px-8 pb-8">
          {isEditing ? (
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Areas of Interest (Select up to 5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        editInterests.includes(interest)
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors">
                  Save Changes
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(profile.name); setEditInterests(profile.interests); }} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-full font-medium hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">{profile.name}</h1>
              <p className="text-slate-500 mb-8">{profile.email}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100 flex items-center gap-3">
                  <div className="bg-brand-100 p-2.5 rounded-xl text-brand-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-800">Total Hours</p>
                    <p className="text-2xl font-bold text-brand-900">{profile.completedHours}</p>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-2xl p-5 border border-cyan-100 flex items-center gap-3">
                  <div className="bg-cyan-100 p-2.5 rounded-xl text-cyan-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-cyan-800">Impact Level</p>
                    <p className="text-2xl font-bold text-cyan-900">
                      {profile.completedHours > 50 ? 'Gold' : profile.completedHours > 20 ? 'Silver' : 'Bronze'}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 flex items-center gap-3">
                  <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-800">Organizations</p>
                    <p className="text-2xl font-bold text-purple-900">{profile.pastOrganizations.length}</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex items-center gap-3">
                  <div className="bg-red-100 p-2.5 rounded-xl text-red-500 shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-700">Saved</p>
                    <p className="text-2xl font-bold text-red-900">{(profile.favorites ?? []).length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Your Interests</h3>
                  {profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(interest => (
                        <span key={interest} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No interests selected yet. Edit your profile to add some!</p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
                  {profile.pastOrganizations.length > 0 ? (
                    <ul className="space-y-3">
                      {profile.pastOrganizations.map((org, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                          Volunteered with {org}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">You haven't logged any volunteer hours yet. Find an opportunity and get started!</p>
                  )}
                </div>
              </div>

              {/* Saved Opportunities */}
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                  Saved Opportunities
                </h3>
                {(profile.favorites ?? []).length > 0 ? (() => {
                  const favOpps = MOCK_OPPORTUNITIES.filter(o => (profile.favorites ?? []).includes(o.id));
                  return favOpps.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favOpps.map(opp => (
                        <div key={opp.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <img src={opp.imageUrl} alt={opp.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{opp.title}</p>
                            <p className="text-xs text-brand-600 truncate">{opp.organizationName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Your saved opportunities will appear here.</p>
                  );
                })() : (
                  <p className="text-slate-500 text-sm">No saved opportunities yet. Hit the heart button on any opportunity to save it!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
