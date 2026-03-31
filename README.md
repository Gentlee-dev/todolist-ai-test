# TodoList App

AI 자동화 파이프라인 테스트를 위한 풀스택 TodoList 애플리케이션입니다.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspace
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui
- **Backend**: Express 5 + Prisma ORM + PostgreSQL 16
- **State Management**: TanStack Query (Optimistic Updates)
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest + Supertest (Backend TDD)
- **Infrastructure**: Docker Compose

## Project Structure

```
todolist-ai-test/
├── apps/
│   ├── web/          # Next.js 16 frontend (port 3000)
│   └── server/       # Express 5 backend (port 4000)
├── packages/
│   └── shared/       # Shared types & constants
├── docker-compose.yml
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d db

# Set up database
pnpm --filter @todolist/server exec npx prisma migrate dev
pnpm --filter @todolist/server exec npx prisma db seed

# Start development servers
pnpm dev
```

### Environment Variables

**apps/server/.env**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todolist
```

**apps/web/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Features

- Todo CRUD with inline editing
- Category management (8 preset colors, max 10)
- Tag management with per-todo tagging
- Status filtering (All / Active / Completed)
- Category & tag filtering
- Drag-and-drop reordering with optimistic updates
- Responsive design (360px ~ 1440px)
- Keyboard accessible

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /todos | Get todos (with filters) |
| POST | /todos | Create todo |
| PATCH | /todos/:id | Update todo |
| DELETE | /todos/:id | Delete todo |
| DELETE | /todos/completed | Delete completed |
| PATCH | /todos/reorder | Reorder todos |
| PUT | /todos/:id/tags | Update todo tags |
| GET | /categories | Get categories |
| POST | /categories | Create category |
| PATCH | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |
| GET | /tags | Get tags |
| POST | /tags | Create tag |
| PATCH | /tags/:id | Update tag |
| DELETE | /tags/:id | Delete tag |

## Testing

```bash
# Run backend tests
pnpm --filter @todolist/server test
```

77 tests covering services and API routes with full CRUD operations.

## Architecture

- **Atomic Design**: atoms (shadcn/ui) → molecules → organisms → templates → pages
- **Backend**: Router → Service → Prisma (never call Prisma from routes)
- **Validation**: Zod schemas for all API inputs
- **Error Handling**: AppError class with standardized error codes
- **Optimistic Updates**: TanStack Query onMutate/onError/onSettled pattern
