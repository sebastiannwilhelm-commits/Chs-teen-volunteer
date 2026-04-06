import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Conversation, Message } from '../types';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, getDoc, getDocs,
  serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Send, MessageSquare, Plus, X, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface MessagesProps {
  user: User | null;
  profile: UserProfile | null;
}

function formatTimestamp(ts: { seconds: number; nanoseconds: number } | null): string {
  if (!ts) return '';
  return format(new Date(ts.seconds * 1000), 'MMM d, h:mm a');
}

function getOtherParticipant(conv: Conversation, myUid: string) {
  const otherId = conv.participants.find(id => id !== myUid) ?? '';
  return {
    uid: otherId,
    name: conv.participantNames[otherId] ?? 'Unknown',
    email: conv.participantEmails[otherId] ?? '',
  };
}

export default function Messages({ user, profile }: MessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newText, setNewText] = useState('');
  const [sending, setSending] = useState(false);

  const [showNewConv, setShowNewConv] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  const [showThread, setShowThread] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)));
    }, (err) => console.error('Conversations error:', err));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    const q = query(
      collection(db, 'conversations', activeConvId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (err) => console.error('Messages error:', err));
    return () => unsub();
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConvId || !user) return;
    const convRef = doc(db, 'conversations', activeConvId);
    updateDoc(convRef, { [`unreadCounts.${user.uid}`]: 0 }).catch(() => {});
  }, [activeConvId, user]);

  const openConversation = (convId: string) => {
    setActiveConvId(convId);
    setShowThread(true);
  };

  const sendMessage = async () => {
    if (!newText.trim() || !activeConvId || !user || !profile || sending) return;
    setSending(true);
    const text = newText.trim();
    setNewText('');
    try {
      const convRef = doc(db, 'conversations', activeConvId);
      const convSnap = await getDoc(convRef);
      const convData = convSnap.data() as Conversation;
      const otherId = convData.participants.find(id => id !== user.uid) ?? '';

      await addDoc(collection(db, 'conversations', activeConvId, 'messages'), {
        senderId: user.uid,
        senderName: profile.name,
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${otherId}`]: (convData.unreadCounts?.[otherId] ?? 0) + 1,
        [`unreadCounts.${user.uid}`]: 0,
      });
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError('');
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setSearchError('No user found with that email address.');
      } else {
        const found = snap.docs[0].data() as UserProfile;
        if (found.uid === user?.uid) {
          setSearchError("You can't message yourself.");
        } else {
          setSearchResult(found);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Something went wrong. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async (other: UserProfile) => {
    if (!user || !profile) return;
    const existing = conversations.find(c =>
      c.participants.includes(other.uid) && c.participants.includes(user.uid)
    );
    if (existing) {
      openConversation(existing.id);
      setShowNewConv(false);
      setSearchEmail('');
      setSearchResult(null);
      return;
    }
    try {
      const convRef = await addDoc(collection(db, 'conversations'), {
        participants: [user.uid, other.uid],
        participantNames: { [user.uid]: profile.name, [other.uid]: other.name },
        participantEmails: { [user.uid]: profile.email, [other.uid]: other.email },
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCounts: { [user.uid]: 0, [other.uid]: 0 },
      });
      openConversation(convRef.id);
      setShowNewConv(false);
      setSearchEmail('');
      setSearchResult(null);
    } catch (err) {
      console.error('Create conversation error:', err);
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view messages</h2>
        <p className="text-slate-500">Connect with other volunteers and coordinate your efforts.</p>
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCounts?.[user.uid] ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-12rem)] min-h-[500px]">

        {/* Sidebar */}
        <div className={`${showThread ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 shrink-0`}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-slate-900">Messages</h2>
              {totalUnread > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNewConv(true)}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No conversations yet.<br />Click "New" to start one.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv, user.uid);
                const unread = conv.unreadCounts?.[user.uid] ?? 0;
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full text-left px-4 py-4 border-b border-slate-100 flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-brand-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                          {other.name}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-slate-400 shrink-0 ml-2">
                            {format(new Date(conv.lastMessageAt.seconds * 1000), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate ${unread > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <span className="ml-2 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread Panel */}
        <div className={`${!showThread ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
              <MessageSquare className="w-16 h-16 opacity-30" />
              <p className="text-slate-400 font-medium">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
                <button
                  onClick={() => { setShowThread(false); setActiveConvId(null); }}
                  className="md:hidden p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {getOtherParticipant(activeConv, user.uid).name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{getOtherParticipant(activeConv, user.uid).name}</p>
                  <p className="text-xs text-slate-400">{getOtherParticipant(activeConv, user.uid).email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-xs text-slate-400 px-1">
                            {msg.createdAt ? formatTimestamp(msg.createdAt) : ''}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-200 flex items-end gap-2">
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-400 focus:bg-white transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newText.trim() || sending}
                  className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConv && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowNewConv(false); setSearchEmail(''); setSearchResult(null); setSearchError(''); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl text-slate-900">New Message</h3>
                <button
                  onClick={() => { setShowNewConv(false); setSearchEmail(''); setSearchResult(null); setSearchError(''); }}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <label className="block text-sm font-medium text-slate-700 mb-1">Find user by email</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={e => { setSearchEmail(e.target.value); setSearchResult(null); setSearchError(''); }}
                  onKeyDown={e => e.key === 'Enter' && searchUser()}
                  placeholder="volunteer@example.com"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-400 text-sm"
                />
                <button
                  onClick={searchUser}
                  disabled={searching || !searchEmail.trim()}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  {searching ? 'Finding…' : 'Find'}
                </button>
              </div>

              {searchError && (
                <p className="text-sm text-red-600 mb-4">{searchError}</p>
              )}

              {searchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                    {searchResult.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{searchResult.name}</p>
                    <p className="text-xs text-slate-400 truncate">{searchResult.email}</p>
                  </div>
                  <button
                    onClick={() => startConversation(searchResult)}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors shrink-0"
                  >
                    Message
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
