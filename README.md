# StudyClaw 🦁

AI-powered study assistant for students. Built with OpenClaw, branded as StudyClaw.

---

## The Team

| Agent | Role | Description |
|-------|------|-------------|
| **Dixie** 🐕 | Head Tutor | Grey/white Staffordshire Bull Terrier. Onboards students, handles system queries (Auri/Crypto only) |
| **Chill Vic** 😎 | Preset #1 | Cool substitute. Chill vibes, lets you curse, super helpful |
| **Sgt. Strict** 🧑‍🏫 | Preset #2 | No-nonsense. High expectations, gets things done |
| **[Your Agent]** | Custom | Pick a preset or build your own |

---

## Features

### For Students
- 🤖 **AI Study Partner** - Personalized agent with hard-coded education tools
- 📚 **Flashcards** - Auto-generate from notes, spaced repetition
- 📅 **Calendar** - Track classes, exams, assignments
- 📧 **Email Org** - Summarize, extract due dates
- 🔬 **Research Helper** - Scholar search, paper summaries
- 📝 **Homework Help** - Step-by-step guidance (not answers)
- ⏰ **Reminders** - Test alerts, study streaks

### For Admins (Auri/Crypto)
- `GET /api/v1/dixie/status` - User count, agent stats
- `GET /api/v1/dixie/health` - Server health check

---

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: OpenClaw (hidden from students)
- **Auth**: JWT + Google OAuth
- **Deployment**: Docker + Docker Compose

---

## Quick Start

### Local Development

```bash
# Clone
git clone https://github.com/cryptorich615/studyclaw.git
cd studyclaw

# Install deps
npm install
npx prisma generate

# Setup env
cp .env.example .env
# Edit .env with your values

# Run database
docker-compose up -d db

# Start dev server
npm run dev
```

### Production (Docker)

```bash
# Clone and setup
git clone https://github.com/cryptorich615/studyclaw.git
cd studyclaw
cp .env.example .env

# Edit .env with production values:
# - DATABASE_URL
# - JWT_SECRET
# - OPENCLAW_URL (your OpenClaw instance)
# - OPENCLAW_TOKEN
# - ADMIN_KEY

# Start everything
docker-compose up -d
```

The API runs on `http://localhost:3000`

---

## API Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Agent
```
GET    /api/v1/agent
PUT    /api/v1/agent
POST   /api/v1/agent/chat
GET    /api/v1/agent/presets
```

### Dixie (Onboarding)
```
POST /api/v1/dixie/chat
GET  /api/v1/dixie/status    (admin only)
GET  /api/v1/dixie/health
```

### Features
```
GET  /api/v1/flashcards/decks
POST /api/v1/flashcards/generate
GET  /api/v1/tasks
POST /api/v1/tasks
GET  /api/v1/calendar/events
GET  /api/v1/calendar/upcoming
POST /api/v1/ai/explain
POST /api/v1/ai/quiz
POST /api/v1/ai/study-plan
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `OPENCLAW_URL` | OpenClaw Gateway URL |
| `OPENCLAW_TOKEN` | OpenClaw API token |
| `ADMIN_KEY` | Admin access key for Dixie |
| `PORT` | Server port (default: 3000) |

---

## Project Structure

```
studyclaw/
├── src/
│   ├── agents/
│   │   ├── dixie/           # Dixie (SOUL.md, AGENTS.md)
│   │   ├── chill-vic/       # Chill Vic preset
│   │   ├── sgt-strict/      # Sgt. Strict preset
│   │   └── base/            # Education tools (all agents)
│   ├── api/
│   │   ├── routes/          # Express routes
│   │   └── middleware/      # Auth, rate limiting
│   ├── services/
│   │   ├── openclaw.ts      # OpenClaw bridge
│   │   └── ai.ts            # AI education tools
│   └── db/
│       └── client.ts        # Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
├── docker-compose.yml
└── Dockerfile
```

---

## License

MIT

---

*Built with 🔮 by Auri for CryptoRixh*
