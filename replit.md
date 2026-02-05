# Replit.md

## Overview

This is a full-stack notes organizer application built with React frontend and Express backend. Users can create, organize, and manage notes within color-coded categories. The app features a clean, modern UI with markdown support for note content, favoriting functionality, and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

**Key Design Patterns**:
- Custom hooks for data fetching (`use-categories.ts`, `use-notes.ts`) that encapsulate React Query mutations and queries
- Shared schema types between frontend and backend via `@shared` path alias
- Component-based architecture with UI primitives from shadcn/ui

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod for request/response validation
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with type-safe route definitions

**Key Design Patterns**:
- Storage abstraction layer (`IStorage` interface) allowing for different storage implementations
- Shared route definitions between frontend and backend for type safety
- Centralized schema definitions using Drizzle with Zod integration (`drizzle-zod`)

### Data Storage
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **Schema**: Two main tables:
  - `categories`: id, name, color (hex code for UI styling)
  - `notes`: id, title, content, categoryId (foreign key), createdAt, isFavorite
- **Migrations**: Managed via Drizzle Kit (`npm run db:push`)

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components (shadcn + custom)
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Route pages
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle table definitions
│   └── routes.ts     # API route type definitions
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit for type-safe queries
- **connect-pg-simple**: PostgreSQL session store (available but not actively used for sessions)

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **date-fns**: Date formatting utilities
- **react-markdown** + **remark-gfm**: Markdown rendering in notes
- **Radix UI primitives**: Accessible component foundations (via shadcn/ui)

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **Drizzle Kit**: Database schema management and migrations