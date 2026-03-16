import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Leaf, 
  BookOpen, 
  Anchor, 
  Search, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// --- Mock Data ---
type Category = 'All' | 'Environment' | 'Community' | 'Animals' | 'Education';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: Category;
  ageRequirement: string;
  location: string;
  timeCommitment: string;
  description: string;
  imageUrl: string;
  icon: React.ElementType;
}

const OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Beach Cleanup Guardian',
    organization: 'Surfrider Foundation Charleston',
    category: 'Environment',
    ageRequirement: '12+',
    location: 'Folly Beach & Isle of Palms',
    timeCommitment: '2-3 hours / weekend',
    description: 'Help keep our beautiful Lowcountry beaches clean! Join our weekend squads to collect litter, record data on marine debris, and protect local wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80fbfc5?auto=format&fit=crop&q=80&w=800',
    icon: Anchor,
  },
  {
    id: '2',
    title: 'Animal Care Assistant',
    organization: 'Charleston Animal Society',
    category: 'Animals',
    ageRequirement: '14+',
    location: 'North Charleston',
    timeCommitment: '4 hours / month min',
    description: 'Assist with socializing cats, walking dogs, and helping keep animal enclosures clean. A perfect opportunity for teens who love animals and want to make a difference.',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    icon: Heart,
  },
  {
    id: '3',
    title: 'Warehouse Sorting Volunteer',
    organization: 'Lowcountry Food Bank',
    category: 'Community',
    ageRequirement: '13+',
    location: 'Azalea Drive, Charleston',
    timeCommitment: '3 hour shifts',
    description: 'Fight hunger in the Lowcountry by helping sort, pack, and organize donated food items before they are distributed to local pantries and shelters.',
    imageUrl: 'https://images.unsplash.com/photo-1593113513832-f45d42541fb1?auto=format&fit=crop&q=80&w=800',
    icon: Users,
  },
  {
    id: '4',
    title: 'Urban Farm Helper',
    organization: 'The Green Heart Project',
    category: 'Environment',
    ageRequirement: '14+',
    location: 'Downtown Charleston',
    timeCommitment: 'Weekly after school',
    description: 'Get your hands dirty learning about agriculture while helping maintain urban gardens at local schools. Harvest crops and learn about sustainable food systems.',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef71a3a5e48c?auto=format&fit=crop&q=80&w=800',
    icon: Leaf,
  },
  {
    id: '5',
    title: 'Teen Advisory Board',
    organization: 'Charleston County Public Library',
    category: 'Education',
    ageRequirement: '12-18',
    location: 'Various CCPL Branches',
    timeCommitment: '1-2 hours / month',
    description: 'Have a say in library programming! Help plan teen events, recommend books and materials, and assist with children\'s reading programs during the summer.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    icon: BookOpen,
  },
  {
    id: '6',
    title: 'Habitat Build Assistant',
    organization: 'Sea Island Habitat for Humanity',
    category: 'Community',
    ageRequirement: '16+',
    location: 'Johns Island',
    timeCommitment: 'Half or full day shifts',
    description: 'Help build affordable housing for local families. Teens 16+ can participate in construction (no power tools), painting, and landscaping.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
    icon: Users,
  }
];

const CATEGORIES: Category[] = ['All', 'Environment', 'Community', 'Animals', 'Education'];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOpportunities = OPPORTUNITIES.filter((opp) => {
    const matchesCategory = activeCategory === 'All' || opp.category === activeCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 text-white p-2 rounded-lg">
              <Anchor className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              CHS Teen Volun<span className="text-brand-600">Hub</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600">
            <a href="#" className="hover:text-brand-600 transition-colors">Opportunities</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Organizations</a>
            <a href="#" className="hover:text-brand-600 transition-colors">For Schools</a>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558000143-a78f8299c40b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 to-slate-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
            
            {/* Search Bar */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Latest Opportunities
          </h2>
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

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredOpportunities.map((opp) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col"
              >
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={opp.imageUrl} 
                    alt={opp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                    <opp.icon className="w-3.5 h-3.5 text-brand-600" />
                    {opp.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-1 line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-sm font-medium text-brand-600">
                      {opp.organization}
                    </p>
                  </div>

                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {opp.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="truncate">{opp.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{opp.timeCommitment}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-2 text-slate-400" />
                      <span>Ages {opp.ageRequirement}</span>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-colors flex items-center justify-center gap-2">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
            <button 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-4 text-brand-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Call to Action */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Are you a local organization?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            We're always looking for new ways teens can help out in Charleston, Mount Pleasant, West Ashley, and surrounding areas.
          </p>
          <button className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-full font-bold transition-colors inline-flex items-center gap-2">
            Post an Opportunity <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Anchor className="w-6 h-6 text-brand-500" />
            <span className="font-display font-bold text-xl text-slate-900">
              CHS Teen VolunHub
            </span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            Â© {new Date().getFullYear()} Charleston Teen Volunteer Hub. Made for the Lowcountry.
          </p>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-brand-600">About</a>
            <a href="#" className="hover:text-brand-600">Contact</a>
            <a href="#" className="hover:text-brand-600">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
