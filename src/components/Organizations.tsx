import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Globe, ExternalLink } from 'lucide-react';
import { Organization } from '../types';
import { MOCK_ORGANIZATIONS } from '../mockData';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'organizations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const orgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
          setOrganizations(orgs);
        }
      },
      (error) => {
        console.error('Error fetching organizations:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-4">Featured Non-Profits</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover the incredible organizations making a difference in Charleston. Find a cause you're passionate about and start volunteering today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {organizations.map((org, index) => (
          <motion.div 
            key={org.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="h-40 overflow-hidden relative">
              <img src={org.imageUrl} alt={org.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h3 className="absolute bottom-4 left-6 right-6 font-display text-xl font-bold text-white leading-tight">
                {org.name}
              </h3>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <p className="text-slate-600 text-sm mb-6 flex-grow italic">
                "{org.mission}"
              </p>
              
              <div className="space-y-3 mb-6">
                <a href={`mailto:${org.contactEmail}`} className="flex items-center text-sm text-slate-600 hover:text-brand-600 transition-colors">
                  <Mail className="w-4 h-4 mr-3 text-slate-400" />
                  {org.contactEmail}
                </a>
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-slate-600 hover:text-brand-600 transition-colors">
                  <Globe className="w-4 h-4 mr-3 text-slate-400" />
                  Visit Website
                </a>
              </div>

              <button
                onClick={() => navigate('/?org=' + encodeURIComponent(org.name))}
                className="w-full py-3 rounded-xl bg-brand-50 text-brand-700 font-semibold text-sm hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"
              >
                View Opportunities
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
