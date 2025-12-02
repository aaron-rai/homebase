# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Homebase is a household expense management application built with Next.js 16, featuring multi-household support, expense tracking, and shared finance management. The application allows users to manage personal finances independently (solo mode) or collaborate within households.

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing

# Database
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema changes to database (dev)
npx prisma migrate dev   # Create and apply migrations (dev)
npx prisma db seed       # Seed database with test data
npx prisma studio        # Open Prisma Studio GUI
```

## Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM v6
- **Authentication**: NextAuth.js v4 with JWT sessions
- **UI**: React 19, Tailwind CSS 4, shadcn/ui components
- **State**: React hooks (no global state library)

### Database Architecture

**Multi-tenancy Model**: Users can belong to multiple households, with expenses linked to households through a join table.

**Key Models**:
- `User` - Authentication and user profile
- `Household` - Shared expense groups with unique invite codes
- `HouseholdMember` - Many-to-many relationship with role-based access ("admin" or "member")
- `Expense` - Individual expense records with creator reference
- `ExpenseHousehold` - Join table linking expenses to households with split rules
- `Category` - Expense categorization (Food, Utilities, etc.)

**Important Relationships**:
- Expenses belong to ONE user (creator) via `userId`
- Expenses can be linked to MULTIPLE households via `ExpenseHousehold` join table
- The `ExpenseHousehold` model includes `isShared`, `splitRule`, and `customSplits` for expense allocation logic

### Authentication Flow

1. NextAuth.js handles authentication with credentials provider
2. JWT strategy with 30-day sessions
3. User sessions include `id`, `email`, and `name`
4. Auth config in `lib/auth.ts`, routes in `app/api/auth/[...nextauth]/route.ts`
5. Protected pages should use `useSession()` from `next-auth/react`

### API Routes Structure

All API routes follow Next.js App Router conventions in `app/api/`:
- `POST /api/register` - User registration (creates user + default household)
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/households` - Fetch user's households
- `POST /api/households/create` - Create new household
- `POST /api/households/join` - Join household with invite code
- `POST /api/households/delete` - Delete household (admin only)

### Frontend Patterns

**Onboarding Flow**:
- New users land on `/onboarding` after registration
- Can create households, join existing ones, or use solo mode
- Solo mode = no household selection (user operates independently)

**Household Selection**:
- Context menus on household cards provide quick actions (copy invite code, open in new tab, delete)
- Household selection passes `?household=<id>` query param to routes
- Admin users see additional options (delete household)

**UI Components**:
- shadcn/ui components in `components/ui/`
- Toast notifications via `sonner`
- Forms use native React state (no form library)
- Context menus for right-click actions on cards

## Important Configuration

### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (port 5433 by default)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)
- `OLLAMA_API_URL` - Ollama API endpoint (optional, for future AI features)

### Prisma Version Note
**CRITICAL**: This project uses Prisma v6, NOT v7. Prisma v7 has known issues with the config format and TypeScript execution. If you need to modify Prisma:
1. Ensure `@prisma/client@6` and `prisma@6` are installed
2. Schema must include `url = env("DATABASE_URL")` in datasource block
3. Run `npx prisma generate` after schema changes

### Database Seeding
The seed file (`prisma/seed.ts`) creates:
- Test users: aaron@example.com and pronisha@example.com (password: P@ssword1)
- Two households with memberships
- Categories and sample expenses
- Run with `npx prisma db seed`

## Code Conventions

### TypeScript
- Avoid `any` types - use proper interfaces or `unknown`
- Error handling: Use `error instanceof Error` checks in catch blocks
- All React components should be typed, including props interfaces

### File Organization
- Route handlers: `app/api/[route]/route.ts`
- Pages: `app/[route]/page.tsx`
- Shared UI: `components/ui/` (shadcn components)
- Utilities: `lib/` (auth, database clients)
- Database schema: `prisma/schema.prisma`

### Styling
- Tailwind utility classes only
- Use `cn()` from `lib/utils` for conditional classes
- Follow shadcn/ui patterns for component variants

## Common Gotchas

1. **Prisma Client Import**: Always import from `@/lib/prisma`, not directly from `@prisma/client`
2. **Auth Session**: Use `useSession()` on client, `getServerSession(authOptions)` on server
3. **Household Context**: Expenses are linked via join table, NOT directly to households
4. **Invite Codes**: Must be unique 6-character strings (generated in `lib/invite-code.ts`)
5. **Role Checks**: Verify user role in `HouseholdMember` before admin operations
