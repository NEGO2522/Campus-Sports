# CampusLeague Frontend

React application for CampusLeague, a college sports discovery and tournament platform.

## Tech Stack

- React 19, Vite 7
- Tailwind CSS 4, MUI v7
- Framer Motion
- Socket.io client

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

App starts on http://localhost:5173

## Environment Variables

```
VITE_API_URL=/api              # Backend API base URL
VITE_GOOGLE_CLIENT_ID=         # Google OAuth client ID
```

## Folder Structure

```
src/
├── components/          # Pages and UI components
├── auth/                # Login and auth flow
├── hooks/               # Custom React hooks
├── utils/               # Helpers and API client
└── App.jsx              # Root routes
```

## Notes

- Google OAuth requires the backend to be running
- Socket.io connects for real-time match and participant updates
- Mobile-first responsive design with bottom navigation
