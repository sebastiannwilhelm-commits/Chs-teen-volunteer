import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Calendar as CalendarIcon, Users, Building } from 'lucide-react';
import { Opportunity } from '../types';
import { format, parseISO } from 'date-fns';
import AddToCalendarButton from './AddToCalendarButton';

interface Props {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OpportunityModal({ opportunity, isOpen, onClose }: Props) {
  if (!opportunity) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="relative h-64 shrink-0">
              <img 
                src={opportunity.imageUrl} 
                alt={opportunity.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-800 shadow-sm">
                {opportunity.category}
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">{opportunity.title}</h2>
              <div className="flex items-center text-brand-600 font-medium mb-6">
                <Building className="w-4 h-4 mr-2" />
                {opportunity.organizationName}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-start text-slate-700">
                  <CalendarIcon className="w-5 h-5 mr-3 text-brand-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Date</p>
                    <p className="font-medium text-slate-900">{format(parseISO(opportunity.date), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start text-slate-700">
                  <MapPin className="w-5 h-5 mr-3 text-brand-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Location</p>
                    <p className="font-medium text-slate-900">{opportunity.location}</p>
                  </div>
                </div>
                <div className="flex items-start text-slate-700">
                  <Clock className="w-5 h-5 mr-3 text-brand-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Commitment</p>
                    <p className="font-medium text-slate-900">{opportunity.timeCommitment}</p>
                  </div>
                </div>
                <div className="flex items-start text-slate-700">
                  <Users className="w-5 h-5 mr-3 text-brand-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Requirements</p>
                    <p className="font-medium text-slate-900">Ages {opportunity.ageRequirement}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-bold text-lg text-slate-900 mb-3">About this opportunity</h3>
                <p className="text-slate-600 leading-relaxed">{opportunity.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => window.open(opportunity.signUpUrl, '_blank')}
                  className="flex-1 py-4 text-lg rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Sign Up Now
                </button>
                <AddToCalendarButton opportunity={opportunity} className="sm:w-auto w-full py-4" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
