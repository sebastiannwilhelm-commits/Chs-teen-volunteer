import React, { useState, useEffect } from 'react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Filter } from 'lucide-react';
import { Opportunity, Category } from '../types';
import { MOCK_OPPORTUNITIES } from '../mockData';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import OpportunityModal from './OpportunityModal';
import AddToCalendarButton from './AddToCalendarButton';

const CATEGORIES: Category[] = ['All', 'Environment', 'Community', 'Animals', 'Education'];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [activeOrg, setActiveOrg] = useState<string>('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'opportunities'), (snapshot) => {
      if (!snapshot.empty) {
        const opps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(opps);
      }
    });
    return () => unsubscribe();
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Get unique organizations for the filter dropdown
  const uniqueOrgs = ['All', ...Array.from(new Set(opportunities.map(opp => opp.organizationName)))];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = activeCategory === 'All' || opp.category === activeCategory;
    const matchesOrg = activeOrg === 'All' || opp.organizationName === activeOrg;
    return matchesCategory && matchesOrg;
  });

  const getEventsForDate = (date: Date) => {
    return filteredOpportunities.filter(opp => isSameDay(parseISO(opp.date), date));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      {/* Calendar Section */}
      <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={activeCategory} 
                onChange={(e) => setActiveCategory(e.target.value as Category)}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <select 
                value={activeOrg} 
                onChange={(e) => setActiveOrg(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
              >
                {uniqueOrgs.map(org => <option key={org} value={org}>{org}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-xl bg-slate-50/50"></div>
          ))}
          
          {daysInMonth.map(date => {
            const events = getEventsForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const today = isToday(date);
            
            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`h-24 rounded-xl p-2 flex flex-col items-start justify-start transition-all border ${
                  isSelected 
                    ? 'border-brand-500 bg-brand-50 shadow-sm' 
                    : today 
                      ? 'border-slate-300 bg-slate-50' 
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  today ? 'bg-slate-900 text-white' : 'text-slate-700'
                }`}>
                  {format(date, 'd')}
                </span>
                
                <div className="mt-1 w-full flex flex-col gap-1">
                  {events.slice(0, 2).map(event => (
                    <div key={event.id} className="text-xs truncate px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 w-full text-left">
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-slate-500 px-1 font-medium">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List Section */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <h3 className="font-display text-xl font-bold text-slate-900">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
        </h3>
        
        {selectedDate && selectedEvents.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 border-dashed">
            <p className="text-slate-500">No volunteer events scheduled for this day.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {selectedEvents.map(event => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                  {format(parseISO(event.date), 'h:mm a')}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                <p className="text-sm text-slate-600 mb-4">{event.organizationName}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{event.timeCommitment}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => window.open(event.signUpUrl, '_blank')}
                    className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Sign Up
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedOpp(event)}
                      className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </button>
                    <AddToCalendarButton opportunity={event} className="flex-1 text-sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <OpportunityModal 
        opportunity={selectedOpp} 
        isOpen={!!selectedOpp} 
        onClose={() => setSelectedOpp(null)} 
      />
    </div>
  );
}
