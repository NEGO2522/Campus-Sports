# CampusLeague Backend

REST API for CampusLeague, a college sports platform. Handles auth, events, teams, matches, and real-time updates.

## Overview

This backend powers event discovery, team management, tournament brackets, and live scoring. Built with raw SQL queries (no ORM) for performance and control.

## Tech Stack

- Node.js, Express 4
- PostgreSQL (pg driver)
- JWT + Google OAuth 2.0
- Socket.io 4

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Server starts on http://localhost:5000

## Environment Variables

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campusleague
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
FRONTEND_URL=http://localhost:5173
```

## API Overview

- `POST /api/auth/google` — Google OAuth login/register
- `GET /api/auth/me` — Current user
- `/api/events` — Events CRUD, join/leave, matches
- `/api/users` — Profiles, search, colleges
- `/api/teams` — Create, join, leave, invite
- `/api/invites` — Pending, accept, decline
- `/api/stats` — Public counts

## Database

10 tables: colleges, users, events, teams, team_members, event_participants, matches, notifications, team_invites, point_logs.

Run `npm run db:migrate` to create tables. `npm run db:seed` to seed college data.

## Deployment

Railway. Set environment variables in dashboard. Auto-deploys on push to main.
