# OperatorOS

## Overview

OperatorOS is a behavioral tracking and leverage creation system designed for solo builders and operators. The application helps users track daily friction points, log decisions, and synthesize these inputs into actionable business leverage and content ideas using AI-powered analysis.

The core workflow follows: daily input capture → AI-powered behavioral analysis → leverage synthesis → content generation. Users document friction, decisions, and assumptions through a structured daily protocol, and the system identifies patterns across time to generate insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Build Tool**: Vite with custom plugins for Replit integration

Key pages: Dashboard, Daily Protocol, Decision Engine, Leverage Diff, Content Lab, and System settings.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST API with JSON responses
- **Authentication**: Replit Auth (OpenID Connect) with session storage in PostgreSQL
- **AI Integration**: OpenAI API via Replit AI Integrations for synthesis, content generation, and analysis

The server handles user data persistence, AI synthesis requests, and serves the static frontend in production.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/`
- **Key Tables**: 
  - `users` and `sessions` (Replit Auth - mandatory)
  - `daily_entries` - User's daily friction/decisions/assumptions logs
  - `decision_entries` - Tracked decisions with context and outcomes
  - `user_stats` - Streak counts, onboarding state
  - `conversations` and `messages` - Chat/voice interaction history

### Build System
- **Client**: Vite builds to `dist/public`
- **Server**: esbuild bundles to `dist/index.cjs`
- **Development**: `npm run dev` runs tsx for hot-reloading server
- **Database**: `npm run db:push` syncs schema with Drizzle Kit

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components and layouts
    pages/        # Route pages
    hooks/        # React hooks including auth
    lib/          # Utilities, API client, store
server/           # Express backend
  replit_integrations/  # Auth, AI, chat, image modules
shared/           # Shared types and database schema
  models/         # Database models (auth, chat)
  schema.ts       # Main Drizzle schema
```

## External Dependencies

### AI Services
- **OpenAI API**: Powers daily entry synthesis, decision analysis, content generation, and leverage analysis. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables.

### Authentication
- **Replit Auth**: OpenID Connect-based authentication. Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables. User sessions stored in PostgreSQL `sessions` table.

### Database
- **PostgreSQL**: Primary data store. Connection via `DATABASE_URL` environment variable. Uses Drizzle ORM for type-safe queries.

### Storage
- **Replit Object Storage**: Available via `@replit/object-storage` package for file storage needs.

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express-session` / `connect-pg-simple` - Session management
- `passport` / `openid-client` - Authentication
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management
- `zod` / `drizzle-zod` - Schema validation