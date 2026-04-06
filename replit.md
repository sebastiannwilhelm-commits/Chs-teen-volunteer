# CHS Teen VolunHub

A web application for teenagers in the Charleston/Lowcountry area to find volunteer opportunities, manage their profiles, and track service hours.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS 4
- **Auth & DB**: Firebase (Auth, Firestore)
- **AI**: Google Gemini AI (`@google/genai`)
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Project Structure

```
src/
  components/     # UI components (Home, CalendarView, OpportunityModal, etc.)
  App.tsx         # Main app component and routing
  main.tsx        # Entry point
  firebase.ts     # Firebase init + auth helpers
  types.ts        # TypeScript interfaces
  mockData.ts     # Sample/mock data
firebase-applet-config.json  # Firebase project credentials
vite.config.ts               # Vite configuration
```

## Environment Variables

- `GEMINI_API_KEY` - Required for Gemini AI integration
- `VITE_GOOGLE_CLIENT_ID` - Required for Google Calendar integration
- `APP_URL` - App's hosted URL (for OAuth callbacks)

See `.env.example` for reference.

## Development

```bash
npm install
npm run dev   # Starts on http://0.0.0.0:5000
```

## Workflow

- **Start application**: `npm run dev` on port 5000 (webview)

## Deployment

Configured as a static site:
- Build: `npm run build`
- Public dir: `dist`
