import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Users, Search, ChevronRight, Heart, Leaf, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { Category, Opportunity } from '../types';
import { MOCK_OPPORTUNITIES } from '../mockData';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import OpportunityModal from './OpportunityModal';

const CATEGORIES: Category[] = ['All', 'Environment', 'Community', 'Animals', 'Education'];

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Environment': return Leaf;
    case 'Animals': return Heart;
    case 'Education': return BookOpen;
    default: return Users;
  }
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('org') || '');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'opportunities'),
      (snapshot) => {
        if (!snapshot.empty) {
          const opps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
          setOpportunities(opps);
        }
      },
      (error) => {
        console.error('Error fetching opportunities:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory = activeCategory === 'All' || opp.category === activeCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558000143-a78f8299c40b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 to-slate-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block py-1 px-3 rounded-full bg-brand-100 text-brand-900 text-sm font-semibold mb-6">
              Make an impact in the Lowcountry
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-cyan-600">Purpose.</span><br />
              Help Charleston.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10">
              The ultimate directory for teenagers in Charleston, SC to find meaningful volunteer opportunities, earn service hours, and connect with the community.
            </p>
            
            <div className="max-w-xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search for activities or organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm focus:border-brand-500 focus:ring-0 outline-none transition-all text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <h2 className="font-display text-2xl font-bold text-slate-900">Latest Opportunities</h2>
          <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredOpportunities.map((opp) => {
              const Icon = getIconForCategory(opp.category);
              return (
                <motion.div
                  key={opp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={opp.imageUrl} alt={opp.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                      <Icon className="w-3.5 h-3.5 text-brand-600" />
                      {opp.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-1 line-clamp-1">{opp.title}</h3>
                      <p className="text-sm font-medium text-brand-600">{opp.organizationName}</p>
                    </div>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">{opp.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-slate-500">
                        <CalendarIcon className="w-4 h-4 mr-2 text-brand-500" />
                        <span className="font-medium text-slate-700">{format(parseISO(opp.date), 'EEEE, MMMM do, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{opp.timeCommitment}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedOpp(opp)}
                      className="w-full py-3 rounded-xl bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-colors flex items-center justify-center gap-2"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>

      <OpportunityModal 
        opportunity={selectedOpp} 
        isOpen={!!selectedOpp} 
        onClose={() => setSelectedOpp(null)} 
      />
    </>
  );
}
