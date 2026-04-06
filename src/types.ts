export type Category = 'All' | 'Environment' | 'Community' | 'Animals' | 'Education';

export interface Opportunity {
  id: string;
  title: string;
  organizationId: string;
  organizationName: string;
  category: Category;
  ageRequirement: string;
  location: string;
  date: string; // ISO string
  timeCommitment: string;
  description: string;
  imageUrl: string;
  signUpUrl: string;
}

export interface Organization {
  id: string;
  name: string;
  mission: string;
  contactEmail: string;
  website: string;
  imageUrl: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'volunteer' | 'admin';
  completedHours: number;
  interests: string[];
  pastOrganizations: string[];
  favorites: string[];
}

export interface Registration {
  id: string;
  userId: string;
  opportunityId: string;
  status: 'registered' | 'completed' | 'cancelled';
  hoursAwarded: number;
}
