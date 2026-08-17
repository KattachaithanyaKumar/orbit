# Orbit

A Notion-like collaborative workspace application. One workspace — every file, folder, and idea in sync.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (base-nova) |
| State | Redux Toolkit |
| Backend | NestJS 11, TypeScript |
| ORM | TypeORM |
| Database | MySQL |
| Auth | Passport (JWT + Local), bcryptjs |

## Project Structure

```
orbit/
├── frontend/          # Next.js app (App Router)
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Dashboard shell
│   │   └── components/           # Auth modal, theme toggle, toasts
│   ├── components/ui/            # shadcn/ui components
│   ├── lib/                      # API client, utilities
│   └── store/                    # Redux store (auth slice)
│
└── backend/           # NestJS API server
    └── src/
        ├── auth/        # Signup/login, JWT strategy, guards
        └── users/       # User entity, CRUD, DTOs
```

## Prerequisites

- Node.js 18+
- MySQL running locally

## Getting Started

### 1. Database

Create a MySQL database named `orbit`:

```sql
CREATE DATABASE orbit;
```

TypeORM will auto-sync tables on startup (`synchronize: true`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # or create .env with values below
npm run start:dev
```

The API runs on `http://localhost:4000/api`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `orbit-change-this-in-production` | Secret for JWT signing |
| `PORT` | `4000` | Server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |
| `DB_DATABASE` | `orbit` | Database name |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Backend API URL |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | Health check |
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/:id` | Get user |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

## Scripts

**Frontend:**

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
```

**Backend:**

```bash
npm run start:dev     # Start in watch mode
npm run build         # Build
npm run start:prod    # Run production build
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run lint          # ESLint
```

## License

MIT
