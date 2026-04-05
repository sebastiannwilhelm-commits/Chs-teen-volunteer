import { Opportunity, Organization } from './types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org1',
    name: 'Surfrider Foundation Charleston',
    mission: 'Dedicated to the protection and enjoyment of the world\'s ocean, waves, and beaches, for all people, through a powerful activist network.',
    contactEmail: 'volunteer@charleston.surfrider.org',
    website: 'https://charleston.surfrider.org',
    imageUrl: 'https://www.beachsoul.co/cdn/shop/articles/BEACH-CLEAN-UP-Beach-Soul-Portable-Beach-Shower-Camping-Shower_7.jpg?v=1723606083'
  },
  {
    id: 'org2',
    name: 'Charleston Animal Society',
    mission: 'To prevent cruelty to animals and to provide shelter, care, and adoption services for homeless animals.',
    contactEmail: 'teens@charlestonanimalsociety.org',
    website: 'https://charlestonanimalsociety.org',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'org3',
    name: 'Lowcountry Food Bank',
    mission: 'To lead the fight against hunger throughout the 10 coastal counties of South Carolina.',
    contactEmail: 'volunteer@lcfbank.org',
    website: 'https://lowcountryfoodbank.org',
    imageUrl: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp1',
    title: 'Beach Cleanup Guardian',
    organizationId: 'org1',
    organizationName: 'Surfrider Foundation Charleston',
    category: 'Environment',
    ageRequirement: '12+',
    location: 'Folly Beach',
    date: '2026-05-15T11:00:00-04:00', // Friday 11:00 AM EST
    timeCommitment: '11:00AM - 1:00PM',
    description: 'Help keep our beautiful Lowcountry beaches clean! Join our weekend squads to collect litter, record data on marine debris, and protect local wildlife.',
    imageUrl: 'https://www.beachsoul.co/cdn/shop/articles/BEACH-CLEAN-UP-Beach-Soul-Portable-Beach-Shower-Camping-Shower_7.jpg?v=1723606083',
    signUpUrl: 'https://charleston.surfrider.org/volunteer'
  },
  {
    id: 'opp2',
    title: 'Animal Care Assistant',
    organizationId: 'org2',
    organizationName: 'Charleston Animal Society',
    category: 'Animals',
    ageRequirement: '14+',
    location: 'North Charleston',
    date: '2026-03-18T12:00:00-04:00', // Wednesday 12:00 PM EDT
    timeCommitment: '12:00PM - 1:00PM',
    description: 'Assist with socializing cats, walking dogs, and helping keep animal enclosures clean. A perfect opportunity for teens who love animals and want to make a difference.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    signUpUrl: 'https://charlestonanimalsociety.org/volunteer'
  },
  {
    id: 'opp3',
    title: 'Warehouse Sorting Volunteer',
    organizationId: 'org3',
    organizationName: 'Lowcountry Food Bank',
    category: 'Community',
    ageRequirement: '13+',
    location: 'Azalea Drive, Charleston',
    date: '2026-03-24T15:30:00-04:00', // Tuesday 3:30 PM EST
    timeCommitment: '3:30PM - 6:30PM',
    description: 'Fight hunger in the Lowcountry by helping sort, pack, and organize donated food items before they are distributed to local pantries and shelters.',
    imageUrl: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&q=80&w=800',
    signUpUrl: 'https://lowcountryfoodbank.org/get-involved/volunteer/'
  }
];
