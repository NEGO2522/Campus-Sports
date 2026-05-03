# CampusLeague

India's first college sports platform. Discover events, build teams, and compete across campuses.

---

## What is CampusLeague?

CampusLeague is the operating system for college sports in India. Every campus hosts tournaments, matches, and pick-up games, but finding them is harder than it should be. We built CampusLeague to fix that.

Students can browse events by sport and location, register solo or as a team, track live scores in real time, and build a profile that follows them across every college they compete at. Organizers get tools to manage brackets, update scores, and notify participants without relying on WhatsApp chains.

---

## Tech Stack

| Layer        | Technology                                        |
|--------------|---------------------------------------------------|
| Frontend     | React 19, Vite 7, Tailwind CSS 4, Framer Motion  |
| Backend      | Node.js, Express 4                                |
| Database     | PostgreSQL                                        |
| Auth         | Google OAuth 2.0 + JWT                            |
| Real-time    | Socket.io 4                                       |
| Deployment   | Vercel (Frontend), Railway (Backend)              |

---

## Core Features

**Discovery**
- Browse events by sport, college, or city
- Filter by registration status and event type

**Participation**
- Join events as a solo player or team member
- Create teams and invite players from your network
- Accept or decline team invites with one click

**Competition**
- Auto-generated tournament brackets for team events
- Real-time score updates visible to all participants
- Live participant counts via WebSocket

**Profile & Identity**
- Public profiles with sport preferences and college affiliation
- Registration number verification for authenticity
- Event history and participation stats

**Notifications**
- Real-time alerts for invites, match updates, and event changes
- Mobile-friendly notification center

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/your-org/campus-sports.git
cd campus-sports
```

### 2. Backend setup

```bash
cd Backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Backend starts on http://localhost:5000

### 3. Frontend setup

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Frontend starts on http://localhost:5173

---

## Environment Variables

### Backend `.env`

| Variable           | Description                                      |
|--------------------|--------------------------------------------------|
| `PORT`             | Server port (default: 5000)                      |
| `DB_HOST`          | PostgreSQL host                                  |
| `DB_NAME`          | Database name                                    |
| `JWT_SECRET`       | Secret key for signing JWT tokens (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID                       |
| `FRONTEND_URL`     | Allowed frontend origin for CORS                 |

### Frontend `.env`

| Variable                | Description                              |
|-------------------------|------------------------------------------|
| `VITE_API_URL`          | Backend API base URL (e.g. `/api`)       |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID (frontend)    |

---

## Deployment

| Service  | Platform | Notes                          |
|----------|----------|--------------------------------|
| Frontend | Vercel   | Auto-deploy from `main` branch |
| Backend  | Railway  | `railway.json` config included |

---

## Routes

**Public Pages**
- `/` — Landing page
- `/about` — Product overview
- `/contact` — Support form
- `/privacy-policy` — Privacy Policy
- `/terms-of-service` — Terms of Service

**Auth**
- `/login` — Google OAuth login

**Dashboard (requires login)**
- `/dashboard` — Main feed
- `/create-event` — Create new event
- `/manage-events` — Events you created
- `/my-events` — Events you joined
- `/notification` — Invites and alerts
- `/events/:id` — Event details
- `/tournament-bracket/:eventId` — Live brackets
- `/users/:id` — Public user profile
- `/complete-profile` — Finish registration

---

## Founder

Built by **Kshitij Jain** — Founder, CampusLeague, Jaipur

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
