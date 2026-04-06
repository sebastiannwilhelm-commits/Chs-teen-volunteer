import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { CalendarPlus, CheckCircle, Loader2 } from 'lucide-react';
import { Opportunity } from '../types';

interface Props {
  opportunity: Opportunity;
  className?: string;
}

function parseEndTime(startDate: Date, timeCommitment: string): Date {
  const fallback = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  if (timeCommitment.includes('hours')) {
    const hours = parseInt(timeCommitment);
    if (!isNaN(hours)) {
      return new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    }
  } else if (timeCommitment.includes('-')) {
    const parts = timeCommitment.split('-');
    if (parts.length === 2) {
      const endStr = parts[1].trim();
      const match = endStr.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const meridiem = match[3].toUpperCase();
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        const end = new Date(startDate);
        end.setHours(hours, minutes, 0, 0);
        if (end > startDate) return end;
      }
    }
  }

  return fallback;
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

        const startDate = new Date(opportunity.date);
        const endDate = parseEndTime(startDate, opportunity.timeCommitment);

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
    onError: (err) => {
      console.error('Login Failed:', err);
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
        <CheckCircle className="w-4 h-4" />
      ) : (
        <CalendarPlus className="w-4 h-4" />
      )}
      {isAdding ? 'Adding...' : success ? 'Added!' : error ? 'Error' : 'Add to Google Calendar'}
    </button>
  );
}
