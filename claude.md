# CLAUDE.md — TodoList Pipeline Test Project

> This file provides project context for Claude Code to understand the codebase and generate consistent code.
> For detailed specs, see `docs/BRD.md` and `docs/PRD.md`.

---

## 1. Project Overview

- **Purpose**: Validate the AI automation pipeline (planning → design → development) before the main shopping mall project
- **App**: TodoList (CRUD + categories/tags + drag-and-drop reordering)
- **User**: Single user (no auth, hardcoded userId)
- **Environment**: Local Docker Compose

---

## 2. Tech Stack

| Area | Stack |
|------|-------|
| Frontend | Next.js 16 App Router, TypeScript, shadcn/ui, Tailwind CSS v4 |
| Backend | Express, TypeScript, Prisma, PostgreSQL 16 |
| API Communication | TanStack Query (with Optimistic Updates) |
| Drag & Drop | @dnd-kit |
| Testing | Vitest, Supertest (backend TDD) |
| Monorepo | Turborepo, pnpm workspace |
| Infrastructure | Docker Compose (web + server + db) |

---

## 3. Monorepo Structure

```
todolist/
├── apps/
│   ├── web/                    # Next.js 16 frontend (port 3000)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css     # Design tokens (see section 7)
│   │   ├── components/
│   │   │   ├── molecules/      # TodoInput, TodoItem, FilterGroup, etc.
│   │   │   ├── organisms/      # TodoList, FilterBar, CategoryManager, etc.
│   │   │   └── templates/      # TodoPageLayout
│   │   ├── hooks/              # useTodos, useCategories, useTags
│   │   └── lib/                # api.ts, query-client.ts
│   │
│   └── server/                 # Express backend (port 4000)
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/         # todos.ts, categories.ts, tags.ts
│       │   ├── services/       # todo.service.ts, etc.
│       │   ├── middlewares/    # error-handler.ts, validate.ts
│       │   ├── validators/    # todo.validator.ts, etc.
│       │   ├── constants.ts   # DEFAULT_USER_ID
│       │   └── prisma.ts      # Prisma Client instance
│       ├── tests/
│       │   ├── services/       # todo.service.test.ts (unit tests)
│       │   ├── routes/         # todos.test.ts (API integration tests)
│       │   └── setup.ts        # Test DB setup, seed
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
│
├── packages/
│   └── shared/                 # Shared types (frontend + backend)
│       └── src/types/          # todo.ts, category.ts, tag.ts, api.ts
│
├── docs/
│   ├── BRD.md                  # Business Requirements (English)
│   ├── PRD.md                  # Product Requirements (English)
│   └── ko/                     # Korean versions (for reference)
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── claude.md                   # This file
```

---

## 4. Architecture Rules

### 4.1 Frontend

- Use **Atomic Design** structure. Atoms use shadcn/ui directly — do not create wrappers.
- **molecules/**: TodoInput, TodoItem, FilterGroup, CategorySelect, TagSelector, CategoryItem, TagItem, ConfirmDialog
- **organisms/**: TodoList, FilterBar, CategoryManager, TagManager, TagEditModal
- **templates/**: TodoPageLayout
- **pages/**: `app/page.tsx` connects TodoPageLayout with TanStack Query
- One component per file, PascalCase filenames (e.g., `TodoItem.tsx`)
- Use `"use client"` directive only where necessary — minimize its usage.

### 4.2 Backend

- **Router → Service pattern**: Routes handle request parsing/response; services handle business logic + Prisma calls.
- Never call Prisma directly from routes.
- Validation logic lives in validators/ folder, applied as middleware.
- `DEFAULT_USER_ID` is defined in `constants.ts` and used in all queries.
- Errors are handled centrally in `error-handler.ts` middleware.

### 4.3 API Conventions

- Base URL: `http://localhost:4000/api`
- RESTful naming: plural nouns (`/todos`, `/categories`, `/tags`)
- Response format: `{ data: ... }` (success), `{ error: { code, message } }` (failure)
- HTTP status codes: 200 (read), 201 (create), 200 (update/delete), 4xx/5xx (error)
- PATCH: partial update, PUT: full replacement (only for tag replacement)

### 4.4 State Management

- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **Client state**: React `useState` (filters, UI state)
- Do not use Zustand or any other state management library.
- Always apply Optimistic Updates on mutations (modify cache in onMutate → rollback in onError).

### 4.5 Shared Types (`packages/shared`)

- Frontend and backend must use the same types.
- Do not expose Prisma-generated types directly. Define separate interfaces in shared.
- API request/response types are also managed in shared.

---

## 5. Coding Conventions

### 5.1 TypeScript

- No `any`. Use `unknown` + type guards when unavoidable.
- Prefer interface over type alias for object shapes. Use type for unions/utilities.
- No non-null assertion (`!`). Use optional chaining (`?.`) + nullish coalescing (`??`).
- Functional components only. No class components.

### 5.2 Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Component files | PascalCase | `TodoItem.tsx` |
| Hook files | camelCase, use prefix | `useTodos.ts` |
| Utility files | camelCase / kebab-case | `api.ts`, `query-client.ts` |
| Server route files | plural kebab-case | `todos.ts`, `categories.ts` |
| Service files | singular.service | `todo.service.ts` |
| CSS variables | kebab-case | `--color-warm-bg` |
| DB tables | snake_case plural | `todos`, `todo_tags` |
| DB columns | snake_case | `sort_order`, `created_at` |
| Prisma models | PascalCase singular | `Todo`, `Category` |
| API response fields | camelCase | `sortOrder`, `categoryId` |

### 5.3 Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal packages (shared)
import type { Todo } from "@todolist/shared";

// 3. Internal modules (absolute paths)
import { TodoItem } from "@/components/molecules/TodoItem";
import { useTodos } from "@/hooks/useTodos";

// 4. Relative imports (same folder)
import { formatDate } from "./utils";
```

### 5.4 Error Handling

- Frontend: Handle in TanStack Query's `onError` callback. Show toast or error message.
- Backend: Services throw custom errors → error-handler middleware catches → returns standard error response.
- Do not overuse try-catch. Only handle expected errors explicitly.

### 5.5 Git Conventions

- **Commit per logical unit**: One commit per meaningful change (e.g., "add Todo CRUD service", "add category filter UI"). Do not bundle unrelated changes.
- **Conventional Commits** format:
  - `feat: add todo CRUD API`
  - `fix: handle empty text in createTodo`
  - `refactor: extract validation middleware`
  - `test: add todo service unit tests`
  - `chore: configure Docker Compose`
  - `style: apply design tokens to TodoItem`
- Commit message in English, imperative mood, lowercase.
- Keep commits atomic — each commit should build and pass tests independently.

---

## 6. Category Preset Colors

8 preset colors for categories. Stored as hex in DB, used as badge colors on the frontend.

| Name | Background | Text | Default Use |
|------|-----------|------|-------------|
| Blue | `#EFF6FF` | `#2563EB` | Work |
| Green | `#F0FDF4` | `#16A34A` | Personal |
| Amber | `#FFFBEB` | `#D97706` | Study |
| Red | `#FEF2F2` | `#DC2626` | Urgent |
| Purple | `#FAF5FF` | `#9333EA` | Project |
| Pink | `#FDF2F8` | `#DB2777` | Shopping |
| Teal | `#F0FDFA` | `#0D9488` | Health |
| Coral | `#FFF7ED` | `#EA580C` | Hobby |

Implementation (defined in shared package):
```typescript
export const CATEGORY_COLORS = {
  "#2563EB": { bg: "#EFF6FF", text: "#2563EB", label: "Blue" },
  "#16A34A": { bg: "#F0FDF4", text: "#16A34A", label: "Green" },
  "#D97706": { bg: "#FFFBEB", text: "#D97706", label: "Amber" },
  "#DC2626": { bg: "#FEF2F2", text: "#DC2626", label: "Red" },
  "#9333EA": { bg: "#FAF5FF", text: "#9333EA", label: "Purple" },
  "#DB2777": { bg: "#FDF2F8", text: "#DB2777", label: "Pink" },
  "#0D9488": { bg: "#F0FDFA", text: "#0D9488", label: "Teal" },
  "#EA580C": { bg: "#FFF7ED", text: "#EA580C", label: "Coral" },
} as const;
```

DB stores only the text color in the `color` column. Background is derived on the frontend via the preset map.

---

## 7. Design Tokens

E-commerce tone design system based on v0 prototype. No dark mode.

### 7.1 Custom Tokens for globals.css

```css
:root {
  /* Warm Background */
  --color-warm-bg: #FDF8F3;
  --color-warm-surface: #FFF9F5;
  --color-warm-surface-hover: #FFF5EE;
  --color-warm-border: #F0E6DB;

  /* Primary (Coral/Warm Red) */
  --color-primary-main: #E8654A;
  --color-primary-hover: #D45A40;
  --color-primary-light: #FDEBE6;
  --color-primary-foreground: #FFFFFF;

  /* Text */
  --color-text-strong: #2C2620;
  --color-text-default: #4A4239;
  --color-text-muted: #8C8279;
  --color-text-disabled: #B8AFA6;

  /* Status */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;

  /* Tag */
  --color-tag-bg: #FFFFFF;
  --color-tag-border: #E0D8CF;
  --color-tag-text: #6B6259;

  /* Spacing Scale */
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
  --space-8: 2rem;     --space-12: 3rem;    --space-16: 4rem;

  /* Typography */
  --font-family-base: "Pretendard Variable", Pretendard, -apple-system,
    BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-size-xs: 0.75rem;   --font-size-sm: 0.875rem;
  --font-size-base: 1rem;    --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-weight-normal: 400;  --font-weight-medium: 500;
  --font-weight-semibold: 600; --font-weight-bold: 700;
  --line-height-tight: 1.25;  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Border Radius */
  --radius-sm: 0.25rem;  --radius-md: 0.5rem;  --radius-lg: 0.75rem;
  --radius-xl: 1rem;     --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(44, 38, 32, 0.04);
  --shadow-md: 0 2px 8px rgba(44, 38, 32, 0.06);
  --shadow-lg: 0 4px 16px rgba(44, 38, 32, 0.08);

  /* Transition */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* Layout */
  --max-width-content: 720px;
  --header-height: 64px;
}
```

### 7.2 Tailwind v4 CSS-first Configuration

Tailwind v4 uses the `@theme` directive in CSS instead of `tailwind.config.ts`.

```css
@import "tailwindcss";

@theme {
  --color-warm-bg: #FDF8F3;
  --color-warm-surface: #FFF9F5;
  --color-warm-surface-hover: #FFF5EE;
  --color-warm-border: #F0E6DB;
  --color-primary-main: #E8654A;
  --color-primary-hover: #D45A40;
  --color-primary-light: #FDEBE6;
  --color-text-strong: #2C2620;
  --color-text-default: #4A4239;
  --color-text-muted: #8C8279;
  --color-text-disabled: #B8AFA6;
  --color-tag-bg: #FFFFFF;
  --color-tag-border: #E0D8CF;
  --color-tag-text: #6B6259;
  --font-base: "Pretendard Variable", Pretendard, -apple-system,
    BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
}
```

**Rules**:
- Do NOT create a `tailwind.config.ts` file.
- All custom tokens go in the `@theme` block in globals.css.
- shadcn/ui default tokens stay in `:root`; e-commerce custom tokens go in `@theme`.
- `--color-*` → auto-generates `bg-*`, `text-*` utilities
- `--font-*` → auto-generates `font-*` utilities

### 7.3 Font

- **Pretendard**: Premium sans-serif with Korean + English support
- Load via CDN or `@font-face`
- Replaces Geist (used by v0) which lacks Korean support

### 7.4 Design Principles

1. **Warmth**: Never use pure white (#FFF) or pure black (#000). Use warm off-white/dark gray.
2. **Card-based**: Wrap major elements in cards (background + subtle shadow).
3. **Generous spacing**: Ample spacing between elements. No cramped UI.
4. **Coral Primary**: Coral color for CTA buttons, active states, completed checkmarks.
5. **Badge styles**: Categories = colored filled pills, Tags = outlined pills.
6. **Hover feedback**: Background color change or shadow enhancement on hover.
7. **Completed items**: Strikethrough + 50% opacity + disabled text color.

---

## 8. Interaction Patterns

### 8.1 Drag & Drop (@dnd-kit)
- Use DndContext + SortableContext
- While dragging: enhanced shadow + slight lift (scale 1.02)
- After drop: PATCH /todos/reorder + Optimistic Update

### 8.2 Inline Editing
- Click text → transforms to input field
- Show save (✓) and cancel (✕) buttons
- Enter or ✓ = save, Escape or ✕ = cancel
- Empty text restores original value (does not delete)

### 8.3 Filtering
- Status: toggle group (All / Active / Completed)
- Category: dropdown
- Tags: dropdown (multi-select)
- Combination: AND logic
- Filter values in TanStack Query key → auto-refetch on change

### 8.4 Side Panel (Sheet)
- Settings icon in Header → Sheet opens from right
- Tabs: "Categories" / "Tags"
- Categories: preset color picker (not full color picker)
- Tags: text input only

---

## 9. Environment Variables

```env
# apps/server/.env
DATABASE_URL=postgresql://postgres:postgres@db:5432/todolist
PORT=4000
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000001

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 10. Dev Commands

```bash
# Full stack
docker compose up -d

# Individual (local dev)
pnpm --filter @todolist/server dev
pnpm --filter @todolist/web dev

# Prisma
pnpm --filter @todolist/server prisma migrate dev
pnpm --filter @todolist/server prisma db seed
pnpm --filter @todolist/server prisma generate

# Turborepo
pnpm turbo dev
pnpm turbo build
pnpm turbo lint

# Testing (backend)
pnpm --filter @todolist/server test
pnpm --filter @todolist/server test:watch
pnpm --filter @todolist/server test:coverage
```

---

## 11. Notes

- This project is a pipeline test for the main shopping mall project.
- Design tokens will be reused — change with caution.
- When customizing shadcn/ui, prioritize design tokens from globals.css.
- Avoid over-abstraction. Write clear, readable code.

---

## 12. Testing Strategy (Backend TDD)

### 12.1 Purpose

Validate TDD effectiveness in AI coding and determine applicability to the shopping mall project.

### 12.2 Scope

| Target | Testing | Approach |
|--------|---------|----------|
| Service layer (todo, category, tag) | ✅ TDD | Tests first → implement → pass |
| API routes (integration) | ✅ TDD | Supertest request → response |
| Frontend components | ❌ | Out of scope |
| E2E | ❌ | Out of scope |

### 12.3 Test Stack

- **Vitest**: Test runner (Turborepo + TypeScript, Jest-compatible API)
- **Supertest**: HTTP request testing for Express
- **Prisma**: Test DB (same PostgreSQL, separate schema or transaction rollback)

### 12.4 TDD Flow

```
1. Write test cases from PRD API spec (human)
2. Run pnpm --filter @todolist/server test:watch
3. Tests start red (failing)
4. Ask Claude Code to implement (pass test file as context)
5. Verify green (passing)
6. Refactor (within passing test bounds)
7. Repeat
```

### 12.5 Test Conventions

- Location: `apps/server/tests/services/`, `apps/server/tests/routes/`
- Filename: `{target}.test.ts`
- describe: per function or endpoint
- it: English (e.g., `it("should create a todo")`)
- Each test independently runnable (no inter-test dependencies)
- Reset data in beforeEach

### 12.6 Test Example

```typescript
describe("TodoService", () => {
  describe("createTodo", () => {
    it("should create a todo");
    it("should throw error when text is empty");
    it("should throw error when categoryId does not exist");
    it("should set sortOrder to max + 1");
  });

  describe("reorderTodos", () => {
    it("should update sortOrder per provided order");
    it("should do nothing for empty array");
  });
});

describe("POST /api/todos", () => {
  it("should return 201 with created todo");
  it("should return 400 when text is missing");
});
```

### 12.7 Retrospective Criteria

- AI implementation accuracy from tests
- Test writing time vs. debugging time saved
- TDD effectiveness catching unexpected AI output
- TDD scope for shopping mall (payment, orders, critical logic)