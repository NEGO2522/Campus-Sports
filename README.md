# CampusLeague

> India ka pehla location-based college sports platform — "Meetup.com for college sports"

Students apne college ke aas paas sports events create kar sakte hain, join kar sakte hain, aur tournament khel sakte hain.

---

## Project Structure

```
CampusLeague/
├── Frontend/          # React + Vite + Tailwind
└── Backend/           # Node.js + Express + PostgreSQL
```

---

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Runs on: `http://localhost:5173`

---

## Backend Setup

```bash
cd Backend
npm install
cp .env.example .env      # fill in your values
npm run db:migrate        # create all tables
npm run db:seed           # seed Jaipur colleges
npm run dev
```

Runs on: `http://localhost:5000`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL (raw `pg` driver) |
| Auth | JWT + Google OAuth |
| Real-time | Socket.io |

---

## Core Features

- Location-based event discovery (college-wise)
- Create and join sports events
- Team creation and management
- Tournament brackets and live scores
- College leaderboard
- Real-time notifications

---

## Founder

Built by **Kshitij Jain** — Poornima University, Jaipur
