import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { Opportunity } from '../types';

interface Props {
  opportunity: Opportunity;
  className?: string;
}

export default function AddToCalendarButton({ opportunity, className = '' }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (tokenResponse) => {
      try {
        setIsAdding(true);
        setError(null);
        
        // Parse the start date
        const startDate = new Date(opportunity.date);
        
        // Estimate end date based on timeCommitment (e.g., "4 hours" or "12:00PM - 1:00PM")
        // For simplicity, we'll just add 2 hours if we can't parse it exactly
        let endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        
        if (opportunity.timeCommitment.includes('hours')) {
          const hours = parseInt(opportunity.timeCommitment);
          if (!isNaN(hours)) {
            endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
          }
        } else if (opportunity.timeCommitment.includes('-')) {
          // Try to parse "12:00PM - 1:00PM"
          const parts = opportunity.timeCommitment.split('-');
          if (parts.length === 2) {
            // Just a rough estimation for the end time
            // We'll just use the start date + 2 hours as a fallback if parsing is complex
            // A more robust parser could be added here
          }
        }

        const event = {
          summary: opportunity.title,
          location: opportunity.location,
          description: `${opportunity.description}\n\nOrganization: ${opportunity.organizationName}`,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          throw new Error('Failed to add event to calendar');
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Error adding to calendar:', err);
        setError('Failed to add event');
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsAdding(false);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError('Authentication failed');
      setTimeout(() => setError(null), 3000);
    }
  });

  return (
    <button
      onClick={() => login()}
      disabled={isAdding || success}
      className={`flex items-center justify-center gap-2 ${className} ${
        success 
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
          : error
            ? 'bg-red-100 text-red-700 hover:bg-red-100'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      } transition-colors font-medium rounded-lg py-2 px-4`}
    >
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : success ? (
        <CalendarPlus className="w-4 h-4" />
      ) : (
        <CalendarPlus className="w-4 h-4" />
      )}
      {isAdding ? 'Adding...' : success ? 'Added!' : error ? 'Error' : 'Add to Google Calendar'}
    </button>
  );
}
