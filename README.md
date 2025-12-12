# Homebase

A household expense management application for tracking and splitting expenses across multiple households.

## Features

- Multi-household support with invite codes
- Expense tracking with categories and split rules
- Role-based access (admin/member)
- Solo mode for personal finance management
- JWT authentication with NextAuth.js

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL + Prisma ORM
- NextAuth.js
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
```

3. Set up database:

```bash
npx prisma db push
npx prisma generate
npx prisma db seed  # Optional: adds test data
```

4. Start development server:

```bash
npm run dev
```

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run format       # Format code

npx prisma studio    # Database GUI
npx prisma generate  # Regenerate client
npx prisma db seed   # Seed test data
```

## Test Accounts (Seeded Data)

- aaron@example.com / P@ssword1
- pronisha@example.com / P@ssword1

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/        # NextAuth
│   ├── households/  # Household management
│   └── register/    # User registration
│	└── user/    	 # User profile/theme settings
├── login/           # Login page
├── register/        # Registration page
├── onboarding/      # Household setup
└── page.tsx         # Home

components/ui/       # shadcn/ui components
components/*.tsx     # Shared React components
lib/                 # Auth & utilities
prisma/              # Database schema & migrations
```
