# BRD (Business Requirements Document)

## TodoList Pipeline Test Project

> Date: 2026-03-28
> Author: Gentlee (Lee Jeong-jung)
> Status: **Confirmed**
> Version: 1.0

---

## 1. Project Overview

### 1.1 Purpose
A pilot project to validate the **AI automation pipeline (planning → design → development)** before the main shopping mall project. Through this TodoList app, we test:

- BRD → PRD based AI development workflow
- v0 prototyping → Claude Code development pipeline
- Design token system consistency
- shadcn/ui + Next.js App Router tech stack validation

### 1.2 Scope
- **In Scope**:
  - Frontend TodoList app (Next.js)
  - Backend REST API (Node.js)
  - Monorepo structure (frontend + backend in a single repository)
  - Docker containerization (dev environment + DB)
  - Full stack running locally via Docker Compose
- **Out of Scope**: Authentication/authorization, cloud deployment, CI/CD

### 1.3 Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Complete pipeline walkthrough | BRD → PRD → design → development completed |
| Design token reusability | Tokens directly applicable to the shopping mall project |
| Claude Code automation efficiency | Consistent code generation based on claude.md |
| Monorepo structure validation | Smooth frontend/backend shared type operation |
| Docker dev environment | Full stack startup with a single `docker compose up` |
| Bottleneck identification | Identify points requiring human intervention |

---

## 2. Business Requirements

### 2.1 Core Feature Requirements

#### F1. Todo CRUD
- **Create**: Add todo by entering text
- **Read**: Display full todo list, distinguish completed/active
- **Update**: Inline text editing
- **Delete**: Individual delete + bulk delete of completed items

#### F2. Category/Tag System
- Create, edit, delete categories
- Assign one category per todo (optional)
- Create tags (free text input)
- Assign N tags per todo (optional)
- Filter by category and/or tags

#### F3. Drag-and-Drop Reordering
- Reorder todo items via drag-and-drop
- Persist changed order to server (Optimistic Update applied)
- Mobile touch drag support

### 2.2 Non-Functional Requirements

| Item | Requirement |
|------|-------------|
| Data Persistence | PostgreSQL (Docker container) |
| Responsive | Mobile (360px) ~ Desktop (1440px) |
| Accessibility | Basic keyboard navigation support |
| Performance | No drag lag with 100 items |
| Dev Environment | Full stack startup with a single Docker Compose command |

### 2.3 Design Direction

- **E-commerce tone design tokens** (reusable for the main project)
- Clean, modern commerce UI feel
- Based on shadcn/ui components
- No dark mode (out of v1 scope)

---

## 3. Technical Constraints

### 3.1 Tech Stack (Confirmed)

#### Frontend
- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS v4
- **Drag & Drop**: @dnd-kit (React ecosystem standard)
- **State Management**: React useState/useReducer (simple scope)
- **API Communication**: TanStack Query (server state + Optimistic Updates)

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express (same base as Medusa.js, aligned with shopping mall)
- **Language**: TypeScript
- **ORM**: Prisma
- **DB**: PostgreSQL 16

#### Monorepo
- **Tool**: Turborepo (Vercel ecosystem, great Next.js compatibility)
- **Structure**: `apps/web` (frontend) + `apps/server` (backend) + `packages/shared` (shared types)

#### Infrastructure (Local)
- **Docker Compose**: Full stack orchestration
  - `web` container (Next.js dev server)
  - `server` container (Node.js API server)
  - `db` container (PostgreSQL)
- **Hot reload**: Volume mounts for instant code change reflection

### 3.2 Development Environment
- Docker Desktop
- Node.js 20+ (for local development)
- pnpm package manager (monorepo workspace)

---

## 4. Constraints & Assumptions

### Constraints
- Solo development (leveraging AI automation pipeline)
- Local Docker environment only (no cloud deployment)
- No authentication/authorization (single user)

### Assumptions
- Single user (hardcoded userId, no auth)
- Docker Desktop is installed
- Browser: Latest Chrome
- DB data persisted via Docker volumes (survives container restarts)

---

## 5. Glossary

| Term | Description |
|------|-------------|
| Todo | Individual task item registered by the user |
| Category | Top-level grouping for todos (1:N, single select) |
| Tag | Label attached to todos (N:N, multi select) |
| Design Token | Standardized values (colors, typography, spacing) for UI consistency |

---

## 6. Approval

| Role | Name | Status |
|------|------|--------|
| Planning/Development | Gentlee | ✅ Confirmed (2026-03-28) |

> **Next Step**: PRD → design token definition → development