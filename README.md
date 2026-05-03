# CampusLeague

**India's first college sports platform — discover, join, and compete in sports events near your campus.**

Students can find sports events happening around their college, register as a player or team, track live scores, climb the leaderboard, and connect with athletes from nearby colleges.

---

## What is CampusLeague?

CampusLeague is a full-stack web platform built for college students in India. It solves a simple problem: sports events at college happen, but no one knows about them. CampusLeague gives every college a shared sports calendar and a competitive layer on top of it — tournaments, brackets, team management, and a points-based leaderboard.

---

## Project Structure

```
Campus-Sports/
├── Frontend/          # React 19 + Vite + Tailwind CSS
├── Backend/           # Node.js + Express + PostgreSQL
├── README.md
└── LICENSE
```

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS 4, Framer Motion   |
| UI Library | MUI (Material UI), Lucide Icons, React Icons    |
| Backend    | Node.js, Express                                |
| Database   | PostgreSQL (raw `pg` driver — no ORM)           |
| Auth       | Google OAuth 2.0 + JWT                          |
| Real-time  | Socket.io                                       |
| Deployment | Frontend → Vercel, Backend → Railway            |
| Email      | EmailJS (contact form)                          |

---

## Core Features

- **Google Login** — one-click sign in, no password needed
- **College-based Discovery** — events filtered by your college location
- **Event Management** — create, edit, and delete sports events
- **Participation System** — join as solo player or as part of a team
- **Team Management** — create teams, invite members, manage roster
- **Tournament Brackets** — auto-generated brackets for team events
- **Match Scores** — update live scores, track results per round
- **Leaderboard** — college-wise rankings based on points
- **Notifications** — real-time alerts for invites, match updates, event changes
- **User Profiles** — sport preferences, college, course, registration number
- **Stats Dashboard** — total athletes, events, colleges, and matches

---

## Database Schema (PostgreSQL)

The database has 9 tables:

| Table                | Purpose                                        |
|----------------------|------------------------------------------------|
| `colleges`           | College name, city, state, lat/lng             |
| `users`              | Student profiles linked to colleges            |
| `events`             | Sports events with location, date, type        |
| `teams`              | Teams created for events                       |
| `team_members`       | Many-to-many: users inside teams               |
| `event_participants` | Many-to-many: users registered in events       |
| `matches`            | Match schedule, scores, winner per event round |
| `notifications`      | Per-user real-time notification log            |
| `team_invites`       | Invite system between players                  |
| `point_logs`         | Audit log for every point awarded              |

---

## API Endpoints

### Auth
| Method | Route             | Description                  |
|--------|-------------------|------------------------------|
| POST   | `/api/auth/google` | Google OAuth login / register |
| GET    | `/api/auth/me`     | Get current logged-in user    |

### Events
| Method | Route                              | Description             |
|--------|------------------------------------|-------------------------|
| GET    | `/api/events`                      | List all events         |
| GET    | `/api/events/:id`                  | Get event details       |
| POST   | `/api/events`                      | Create a new event      |
| PUT    | `/api/events/:id`                  | Update an event         |
| DELETE | `/api/events/:id`                  | Delete an event         |
| POST   | `/api/events/:id/join`             | Join an event           |
| POST   | `/api/events/:id/leave`            | Leave an event          |
| GET    | `/api/events/:id/matches`          | Get matches for event   |
| POST   | `/api/events/:id/matches`          | Create a match          |
| PUT    | `/api/events/:id/matches/:matchId` | Update match score      |
| DELETE | `/api/events/:id/matches/:matchId` | Delete a match          |

### Users
| Method | Route                   | Description                      |
|--------|-------------------------|----------------------------------|
| GET    | `/api/users/me`          | Get my profile                   |
| GET    | `/api/users/me/events`   | Get events I joined              |
| PUT    | `/api/users/profile`     | Update my profile                |
| GET    | `/api/users/search`      | Search users by name             |
| GET    | `/api/users/:id`         | Get any user's public profile    |
| GET    | `/api/users/colleges`    | Search colleges by name          |

### Teams
| Method | Route                    | Description              |
|--------|--------------------------|--------------------------|
| POST   | `/api/teams`              | Create a team            |
| GET    | `/api/teams/event/:id`    | Get teams for an event   |
| POST   | `/api/teams/:id/join`     | Join a team              |
| POST   | `/api/teams/:id/leave`    | Leave a team             |
| POST   | `/api/teams/:id/invite`   | Invite a user to team    |

### Invites
| Method | Route                          | Description           |
|--------|--------------------------------|-----------------------|
| GET    | `/api/invites/pending`          | Get my pending invites|
| PUT    | `/api/invites/:id/accept`       | Accept an invite      |
| DELETE | `/api/invites/:id`              | Decline an invite     |

### Stats (Public)
| Method | Route         | Description                                |
|--------|---------------|--------------------------------------------|
| GET    | `/api/stats`   | Total athletes, events, colleges, matches  |

---

## Frontend Routes

| Path                                     | Page                        |
|------------------------------------------|-----------------------------|
| `/`                                      | Home / Landing              |
| `/login`                                 | Google Login                |
| `/dashboard`                             | Main app dashboard          |
| `/create-event`                          | Create a new event          |
| `/manage-events`                         | My created events           |
| `/events/:id`                            | Event details               |
| `/events/:id/edit`                       | Edit event                  |
| `/events/:id/participate`                | Join event (solo/team)      |
| `/events/:id/create-team/:reg`           | Create team for event       |
| `/events/:eventId/matches/:matchId/edit` | Edit match score             |
| `/tournament-bracket/:eventId`           | Tournament bracket view     |
| `/my-events`                             | Events I joined             |
| `/notification`                          | Notifications               |
| `/users/:id`                             | Public user profile         |
| `/complete-profile`                      | Profile setup after login   |
| `/about`                                 | About CampusLeague          |
| `/contact`                               | Contact form                |
| `/privacy-policy`                        | Privacy Policy              |
| `/terms-of-service`                      | Terms of Service            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env       # fill in VITE_API_URL
npm run dev
```

Runs on: `http://localhost:5173`

### Backend

```bash
cd Backend
npm install
cp .env.example .env       # fill in DB credentials, JWT secret, Google OAuth keys
npm run db:migrate          # creates all tables
npm run db:seed             # seeds colleges (Jaipur area)
npm run dev
```

Runs on: `http://localhost:5000`

---

## Environment Variables

### Backend `.env`

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string         |
| `JWT_SECRET`        | Secret key for signing JWT tokens    |
| `GOOGLE_CLIENT_ID`  | Google OAuth 2.0 client ID           |
| `FRONTEND_URL`      | Allowed frontend origin (CORS)       |
| `PORT`              | Server port (default: 5000)          |

### Frontend `.env`

| Variable              | Description                     |
|-----------------------|---------------------------------|
| `VITE_API_URL`        | Backend API base URL            |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (frontend) |

---

## Real-time Events (Socket.io)

The backend emits Socket.io events for live updates.

| Event          | Trigger                                  |
|----------------|------------------------------------------|
| `join_event`   | Client joins a room for an event         |
| `leave_event`  | Client leaves the event room             |
| score updates  | Emitted to event room on match update    |

---

## Founder

Built by **Kshitij Jain** — Founder @Campus Leauge, Jaipur
