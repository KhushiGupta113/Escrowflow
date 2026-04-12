# EscrowFlow

EscrowFlow is a production-shaped full-stack freelance escrow platform with a premium dashboard UX and modular backend architecture.

## Tech Stack

- Frontend: Next.js (React + TypeScript), Tailwind CSS, Framer Motion, React Hook Form + Zod, TanStack Query, Recharts, Socket.io client, Sonner toasts
- Backend: Node.js + Express + TypeScript, MongoDB (Mongoose), Redis, JWT auth, Socket.io, Razorpay integration, rate limiting, Swagger UI

## Core Product Flows Implemented

- User signup/login/refresh (Client, Freelancer, Admin roles)
- Client project creation
- Milestone creation and status lifecycle
- Escrow funding initiation with Razorpay order creation
- Payment verification and funded status transition
- Freelancer work submission
- Safe milestone release with Redis lock and idempotency guard
- Dispute raise + admin resolution path
- Notifications feed endpoint and real-time socket channels
- Dashboard summary endpoint for SaaS-style widgets

## Folder Structure

- `frontend/` modern UI shell and dashboard experience
- `backend/` API modules, data models, and real-time/payment logic

## Backend Architecture

- `src/server.ts` app bootstrap, DB + Redis connect, Socket initialization
- `src/app.ts` routes, middleware, validation, controllers (modular boundaries in one file baseline)
- `src/models.ts` Mongo schemas: users, projects, milestones, payments, disputes, notifications, audit logs
- `src/socket.ts` project/user room events for live updates

## Setup

1. Install deps (root workspace):

```bash
npm install
```

2. Configure backend env:

```bash
cp backend/.env.example backend/.env
```

3. Start backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:5000`.

## API Notes

- Health: `GET /health`
- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
- Projects:
  - `POST /api/projects`
  - `GET /api/projects`
- Milestones:
  - `POST /api/milestones`
  - `POST /api/milestones/:id/submit`
- Escrow:
  - `POST /api/escrow/fund/:milestoneId`
  - `POST /api/escrow/verify`
  - `POST /api/escrow/release/:milestoneId`
- Disputes:
  - `POST /api/disputes`
  - `POST /api/admin/disputes/:id/resolve`
- Notifications:
  - `GET /api/notifications`
- Dashboard:
  - `GET /api/dashboard/summary`
- Docs:
  - `GET /api/docs`

## Production Hardening Next Steps

- Split `app.ts` into strict modules (routes/controllers/services/validators per domain)
- Add refresh token persistence and revocation in Redis
- Razorpay signature verification + webhook endpoint
- Integrate upload pipeline (Cloudinary/S3) for dispute evidence
- Add integration tests and e2e tests
- Improve audit logging and admin moderation analytics
