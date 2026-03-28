# PRD (Product Requirements Document)

## TodoList Pipeline Test Project

> Date: 2026-03-28
> Author: Gentlee (Lee Jeong-jung)
> Status: **Confirmed**
> Version: 1.0
> Related: [BRD v1.0](./BRD.md)

---

## 1. Screen Layout

### 1.1 Single Page Structure

The TodoList is a single-page app (SPA-style). No routing.

```
┌─────────────────────────────────────────────┐
│  Header (logo + app title)                   │
├─────────────────────────────────────────────┤
│  TodoInput (new todo form)                   │
│  ┌─────────────────────────────────────────┐ │
│  │ [text input] [category select] [add btn]│ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  FilterBar (filters + sort)                  │
│  ┌─────────────────────────────────────────┐ │
│  │ [All|Active|Completed] [Category] [Tags]│ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  TodoList (draggable items)                  │
│  ┌─────────────────────────────────────────┐ │
│  │ ☐ Todo 1  [Work]  #urgent  ⋮           │ │
│  │ ☑ Todo 2  [Personal]  #important  ⋮    │ │
│  │ ☐ Todo 3         #urgent #important  ⋮  │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  Footer (summary + clear completed)          │
│  ┌─────────────────────────────────────────┐ │
│  │ 1 of 3 completed  [Clear completed]     │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  CategoryManager (side panel / Sheet)        │
│  TagManager (side panel / Sheet)             │
└─────────────────────────────────────────────┘
```

### 1.2 Detailed Screen Specs

#### Header
- App logo (text or icon)
- App title: "Todo"
- Category/tag management button (toggles side panel)

#### TodoInput
- Text input field (placeholder: "Add a new task...")
- Category dropdown (optional, default: none)
- Add button or Enter key to submit
- Empty text submission: silently ignored (no error shown)
- After adding: clear input field + maintain focus

#### FilterBar
- Status filter: All / Active / Completed (toggle group)
- Category filter: All + registered categories (dropdown)
- Tag filter: select from registered tags (multi-select, click toggle)
- Filter combination: AND logic (status AND category AND tags)

#### TodoItem (individual list item)
- Checkbox: toggle completed/active
- Todo text: click to enter inline edit mode
- Category badge: colored pill showing assigned category
- Tag badges: showing assigned tags
- More menu (⋮): Edit, Edit Tags, Delete
- Drag handle: left-side grip icon (⠿)
- Completed items: strikethrough text + reduced opacity

#### Inline Edit Mode
- Click text → transforms to input field
- Show save button (✓) + cancel button (✕)
- Enter or save button: save
- Escape or cancel button: cancel (restore original text)

#### Tag Edit Modal
- Shows all available tags as toggleable chips
- Currently assigned tags are highlighted/selected
- Can type to create a new tag inline
- Confirm/Cancel buttons at bottom

#### CategoryManager (side panel)
- Category list (name + color)
- Add category (name + color preset selection)
- Edit category (name, color change)
- Delete category (associated todos become "uncategorized")
- Max 10 categories

#### TagManager (side panel)
- Tag list display
- Add tag
- Delete tag (automatically removed from associated todos)
- Edit tag (rename)

#### Footer
- Display total / completed / active counts
- "Clear completed" button (confirmation dialog before bulk delete)

---

## 2. Data Model

### 2.1 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String   @default("Default User")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  todos      Todo[]
  categories Category[]

  @@map("users")
}

model Todo {
  id          String    @id @default(uuid())
  text        String
  completed   Boolean   @default(false)
  sortOrder   Int       @map("sort_order")
  userId      String    @map("user_id")
  categoryId  String?   @map("category_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags        TodoTag[]

  @@index([userId])
  @@index([categoryId])
  @@map("todos")
}

model Category {
  id        String   @id @default(uuid())
  name      String
  color     String   @default("#6B7280")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id])
  todos     Todo[]

  @@unique([userId, name])
  @@map("categories")
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique
  createdAt DateTime  @default(now()) @map("created_at")

  todos     TodoTag[]

  @@map("tags")
}

model TodoTag {
  todoId String @map("todo_id")
  tagId  String @map("tag_id")

  todo   Todo   @relation(fields: [todoId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([todoId, tagId])
  @@map("todo_tags")
}
```

### 2.2 ER Diagram

```
User 1──N Todo N──N Tag
User 1──N Category 1──N Todo
                  (TodoTag junction table)
```

### 2.3 Seed Data

Auto-generated on initial run:
- Default User (fixed id, hardcoded)
- 3 sample categories: Work (#3B82F6), Personal (#10B981), Study (#F59E0B)
- 3 sample tags: urgent, important, later
- 3 sample todos (with category and tag mappings)

---

## 3. API Specification

### 3.1 General Info
- Base URL: `http://localhost:4000/api`
- Content-Type: `application/json`
- Authentication: None (single user, userId hardcoded on server)

### 3.2 Endpoints

#### Todos

| Method | Path | Description |
|--------|------|-------------|
| GET | `/todos` | List todos |
| POST | `/todos` | Create todo |
| PATCH | `/todos/:id` | Update todo (text, completed, category) |
| DELETE | `/todos/:id` | Delete todo |
| DELETE | `/todos/completed` | Bulk delete completed |
| PATCH | `/todos/reorder` | Drag-and-drop reorder |
| PUT | `/todos/:id/tags` | Replace todo's tags |

#### GET /todos

Query parameters:
- `status`: `all` | `active` | `completed` (default: `all`)
- `categoryId`: UUID (optional)
- `tagIds`: comma-separated UUIDs (optional)

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "text": "Todo text",
      "completed": false,
      "sortOrder": 1,
      "categoryId": "uuid | null",
      "category": { "id": "uuid", "name": "Work", "color": "#3B82F6" } | null,
      "tags": [
        { "id": "uuid", "name": "urgent" }
      ],
      "createdAt": "2026-03-28T00:00:00Z",
      "updatedAt": "2026-03-28T00:00:00Z"
    }
  ]
}
```

#### POST /todos

Request:
```json
{
  "text": "Todo text",
  "categoryId": "uuid | null"
}
```

Response: Created Todo object (with empty tags array)

#### PATCH /todos/:id

Request (partial update):
```json
{
  "text": "Updated text",
  "completed": true,
  "categoryId": "uuid | null"
}
```

#### PATCH /todos/reorder

Request:
```json
{
  "orderedIds": ["uuid-3", "uuid-1", "uuid-2"]
}
```

Server bulk-updates sortOrder based on array index.

#### PUT /todos/:id/tags

Request:
```json
{
  "tagIds": ["uuid-1", "uuid-2"]
}
```

Removes all existing tags and replaces with provided tagIds.

---

#### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

#### POST /categories

Request:
```json
{
  "name": "Category name",
  "color": "#3B82F6"
}
```

Constraints: Max 10 per user, no duplicate names.

---

#### Tags

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag |
| PATCH | `/tags/:id` | Update tag name |
| DELETE | `/tags/:id` | Delete tag |

#### POST /tags

Request:
```json
{
  "name": "Tag name"
}
```

Constraints: No duplicate names.

---

### 3.3 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Text is required."
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `CONFLICT` (409 — duplicate name)
- `LIMIT_EXCEEDED` (400 — category limit exceeded)
- `INTERNAL_ERROR` (500)

---

## 4. Component Structure (Atomic Design)

### 4.1 Atoms (shadcn/ui based)
- Button, Input, Checkbox, Badge, DropdownMenu
- Dialog, Sheet (side panel), Separator
- Customized via design tokens (globals.css)

### 4.2 Molecules
- `TodoInput` — text input + category select + add button
- `TodoItem` — checkbox + text + category badge + tag badges + more menu + drag handle
- `FilterGroup` — status filter toggle group
- `CategorySelect` — category dropdown
- `TagSelector` — tag multi-select (for filtering / editing)
- `CategoryItem` — category management row (name + color + edit/delete)
- `TagItem` — tag management row (name + edit/delete)
- `ConfirmDialog` — delete confirmation dialog

### 4.3 Organisms
- `TodoList` — TodoItem list + @dnd-kit drag-and-drop container
- `FilterBar` — FilterGroup + CategorySelect + TagSelector
- `CategoryManager` — Sheet with CategoryItem list + add form
- `TagManager` — Sheet with TagItem list + add form
- `TagEditModal` — Dialog for editing a specific todo's tags

### 4.4 Templates
- `TodoPageLayout` — Header + TodoInput + FilterBar + TodoList + Footer

### 4.5 Pages
- `app/page.tsx` — TodoPageLayout + API integration (TanStack Query)

---

## 5. State Management Strategy

### 5.1 Server State (TanStack Query)

| Query Key | Endpoint | Notes |
|-----------|----------|-------|
| `['todos', filters]` | GET /todos | Auto-refetch on filter change |
| `['categories']` | GET /categories | |
| `['tags']` | GET /tags | |

### 5.2 Mutations + Optimistic Updates

| Mutation | Endpoint | Optimistic Update |
|----------|----------|-------------------|
| createTodo | POST /todos | Append temp item to list |
| updateTodo | PATCH /todos/:id | Immediately update item |
| deleteTodo | DELETE /todos/:id | Immediately remove item |
| deleteCompleted | DELETE /todos/completed | Immediately remove completed |
| reorderTodos | PATCH /todos/reorder | Immediately reflect drag result, rollback on failure |
| updateTodoTags | PUT /todos/:id/tags | Immediately update tags |

### 5.3 Client State (useState)

- `activeFilter`: current status filter (all / active / completed)
- `selectedCategoryId`: selected category filter
- `selectedTagIds`: selected tag filter list
- `editingTodoId`: currently inline-editing todo ID
- `isCategoryPanelOpen`: category panel open state
- `isTagPanelOpen`: tag panel open state

---

## 6. Monorepo Directory Structure

```
todolist/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   │   ├── TodoInput.tsx
│   │   │   │   ├── TodoItem.tsx
│   │   │   │   ├── FilterGroup.tsx
│   │   │   │   ├── CategorySelect.tsx
│   │   │   │   ├── TagSelector.tsx
│   │   │   │   └── ConfirmDialog.tsx
│   │   │   ├── organisms/
│   │   │   │   ├── TodoList.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── CategoryManager.tsx
│   │   │   │   ├── TagManager.tsx
│   │   │   │   └── TagEditModal.tsx
│   │   │   └── templates/
│   │   │       └── TodoPageLayout.tsx
│   │   ├── hooks/
│   │   │   ├── useTodos.ts
│   │   │   ├── useCategories.ts
│   │   │   └── useTags.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── query-client.ts
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── server/
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── todos.ts
│       │   │   ├── categories.ts
│       │   │   └── tags.ts
│       │   ├── services/
│       │   │   ├── todo.service.ts
│       │   │   ├── category.service.ts
│       │   │   └── tag.service.ts
│       │   ├── middlewares/
│       │   │   ├── error-handler.ts
│       │   │   └── validate.ts
│       │   ├── validators/
│       │   │   ├── todo.validator.ts
│       │   │   ├── category.validator.ts
│       │   │   └── tag.validator.ts
│       │   ├── constants.ts
│       │   └── prisma.ts
│       ├── tests/
│       │   ├── services/
│       │   │   ├── todo.service.test.ts
│       │   │   ├── category.service.test.ts
│       │   │   └── tag.service.test.ts
│       │   ├── routes/
│       │   │   ├── todos.test.ts
│       │   │   ├── categories.test.ts
│       │   │   └── tags.test.ts
│       │   └── setup.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   ├── todo.ts
│       │   │   ├── category.ts
│       │   │   ├── tag.ts
│       │   │   └── api.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docs/
│   ├── BRD.md
│   ├── PRD.md
│   └── ko/
│       ├── BRD.ko.md
│       └── PRD.ko.md
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── .env
├── claude.md
└── README.md
```

---

## 7. Docker Compose Configuration

```yaml
services:
  db:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: todolist
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build: ./apps/server
    ports: ["4000:4000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/todolist
      PORT: 4000
    volumes:
      - ./apps/server/src:/app/src

  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [server]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000/api
    volumes:
      - ./apps/web:/app
      - /app/node_modules

volumes:
  pgdata:
```

Start: `docker compose up -d`
Full reset: `docker compose down -v && docker compose up -d`

---

## 8. Development Phases

### Phase 1: Project Initialization
1. Turborepo + pnpm workspace setup
2. Docker Compose + DB startup verification
3. Express server base structure + Prisma schema + migration
4. Seed data execution
5. Next.js 16 project setup + shadcn/ui initialization

### Phase 2: Backend API (TDD)
6. Todo CRUD API (tests first → implement)
7. Category CRUD API
8. Tag CRUD API
9. Reorder API
10. Todo-Tag association API

### Phase 3: Frontend Basics
11. Design token definition (globals.css)
12. TodoPageLayout template
13. TodoInput + TodoList + TodoItem (CRUD integration)
14. Checkbox toggle (completed/active)
15. Inline editing
16. Delete + bulk delete completed

### Phase 4: Categories + Tags
17. CategoryManager (side panel)
18. CategorySelect (dropdown in TodoInput)
19. TagManager (side panel)
20. TagEditModal (per-todo tag editing)
21. FilterBar (status + category + tag filters)

### Phase 5: Drag & Drop
22. @dnd-kit setup + TodoList drag implementation
23. Optimistic Update + rollback on failure
24. Mobile touch drag testing

### Phase 6: Wrap-up
25. Responsive check (360px ~ 1440px)
26. Keyboard accessibility check
27. README.md
28. Pipeline retrospective (bottlenecks, improvements)

---

## 9. Approval

| Role | Name | Status |
|------|------|--------|
| Planning/Development | Gentlee | ✅ Confirmed (2026-03-28) |

> **Next Step**: Design token definition → v0 prototyping → development