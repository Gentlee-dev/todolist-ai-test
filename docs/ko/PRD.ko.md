# PRD (Product Requirements Document)

## TodoList 파이프라인 테스트 프로젝트

> 작성일: 2026-03-28
> 작성자: Gentlee (이정중)
> 상태: 초안
> 버전: 1.0
> 관련 문서: [BRD v1.0](./todolist-brd.md)

---

## 1. 화면 구성

### 1.1 단일 페이지 구조

TodoList는 SPA 스타일의 단일 페이지로 구성한다. 라우팅 없음.

```
┌─────────────────────────────────────────────┐
│  Header (로고 + 앱 타이틀)                    │
├─────────────────────────────────────────────┤
│  TodoInput (할 일 입력 폼)                    │
│  ┌─────────────────────────────────────────┐ │
│  │ [텍스트 입력] [카테고리 선택] [추가 버튼]  │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  FilterBar (필터 + 정렬)                      │
│  ┌─────────────────────────────────────────┐ │
│  │ [전체|미완료|완료] [카테고리] [태그]       │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  TodoList (할 일 목록 — 드래그앤드롭 가능)     │
│  ┌─────────────────────────────────────────┐ │
│  │ ☐ 할 일 1  [업무]  #급한  ⋮             │ │
│  │ ☑ 할 일 2  [개인]  #중요  ⋮             │ │
│  │ ☐ 할 일 3         #급한 #중요  ⋮        │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  Footer (요약 정보 + 완료 항목 일괄 삭제)      │
│  ┌─────────────────────────────────────────┐ │
│  │ 3개 중 1개 완료  [완료 항목 삭제]         │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  CategoryManager (카테고리 관리 — 사이드 패널) │
│  TagManager (태그 관리 — 사이드 패널)          │
└─────────────────────────────────────────────┘
```

### 1.2 화면별 상세 스펙

#### Header
- 앱 로고 (텍스트 로고 또는 아이콘)
- 앱 타이틀: "Todo"
- 카테고리/태그 관리 버튼 (사이드 패널 토글)

#### TodoInput
- 텍스트 입력 필드 (placeholder: "할 일을 입력하세요")
- 카테고리 드롭다운 (선택사항, 기본값: 없음)
- 추가 버튼 또는 Enter 키로 추가
- 빈 텍스트 제출 시 포커스 유지 + 에러 표시하지 않음 (조용히 무시)
- 추가 완료 시 입력 필드 초기화 + 포커스 유지

#### FilterBar
- 상태 필터: 전체 / 미완료 / 완료 (토글 그룹)
- 카테고리 필터: 전체 + 등록된 카테고리 목록 (드롭다운)
- 태그 필터: 등록된 태그 중 선택 (멀티 선택, 클릭 토글)
- 필터 조합: AND 로직 (상태 AND 카테고리 AND 태그)

#### TodoItem (목록 내 개별 항목)
- 체크박스: 완료/미완료 토글
- 할 일 텍스트: 클릭 시 인라인 편집 모드
- 카테고리 뱃지: 지정된 카테고리 표시 (색상 뱃지)
- 태그 뱃지: 지정된 태그 목록 표시
- 더보기 메뉴 (⋮): 편집, 태그 수정, 삭제
- 드래그 핸들: 좌측 드래그 아이콘 (⠿)
- 완료 항목: 텍스트 취소선 + 불투명도 감소

#### 인라인 편집 모드
- 텍스트를 클릭하면 입력 필드로 전환
- 저장 버튼 (✓) + 취소 버튼 (✕) 표시
- Enter 또는 저장 버튼 클릭: 저장
- Escape 또는 취소 버튼 클릭: 취소 (원래 텍스트 복원)

#### 태그 수정 모달
- 현재 할 일에 지정된 태그 표시 (제거 가능)
- 기존 태그 목록에서 추가 선택
- 새 태그 직접 입력 후 추가
- 확인/취소 버튼

#### CategoryManager (사이드 패널)
- 카테고리 목록 표시 (이름 + 색상)
- 카테고리 추가 (이름 + 색상 선택)
- 카테고리 편집 (이름, 색상 변경)
- 카테고리 삭제 (해당 카테고리의 할 일은 "미분류"로 전환)
- 최대 10개 제한

#### TagManager (사이드 패널)
- 태그 목록 표시
- 태그 추가
- 태그 삭제 (해당 태그가 붙은 할 일에서 자동 제거)
- 태그 편집 (이름 변경)

#### Footer
- 전체 / 완료 / 미완료 개수 표시
- "완료 항목 삭제" 버튼 (확인 다이얼로그 후 일괄 삭제)

---

## 2. 데이터 모델

### 2.1 Prisma 스키마

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

### 2.2 ER 다이어그램

```
User 1──N Todo N──N Tag
User 1──N Category 1──N Todo
                  (TodoTag 중간 테이블)
```

### 2.3 시드 데이터

초기 실행 시 자동 생성:
- Default User (id 고정, 하드코딩)
- 샘플 카테고리 3개: 업무(#3B82F6), 개인(#10B981), 공부(#F59E0B)
- 샘플 태그 3개: 급한, 중요, 나중에
- 샘플 할 일 3개 (카테고리, 태그 매핑 포함)

---

## 3. API 명세

### 3.1 기본 정보
- Base URL: `http://localhost:4000/api`
- Content-Type: `application/json`
- 인증: 없음 (단일 사용자, userId 서버에서 하드코딩)

### 3.2 엔드포인트

#### Todos

| Method | Path | 설명 |
|--------|------|------|
| GET | `/todos` | 할 일 목록 조회 |
| POST | `/todos` | 할 일 생성 |
| PATCH | `/todos/:id` | 할 일 수정 (텍스트, 완료 상태, 카테고리) |
| DELETE | `/todos/:id` | 할 일 삭제 |
| DELETE | `/todos/completed` | 완료 항목 일괄 삭제 |
| PATCH | `/todos/reorder` | 드래그앤드롭 순서 변경 |
| PUT | `/todos/:id/tags` | 할 일의 태그 전체 교체 |

#### GET /todos

쿼리 파라미터:
- `status`: `all` | `active` | `completed` (기본: `all`)
- `categoryId`: UUID (선택)
- `tagIds`: 쉼표 구분 UUID 목록 (선택)

응답:
```json
{
  "data": [
    {
      "id": "uuid",
      "text": "할 일 텍스트",
      "completed": false,
      "sortOrder": 1,
      "categoryId": "uuid | null",
      "category": { "id": "uuid", "name": "업무", "color": "#3B82F6" } | null,
      "tags": [
        { "id": "uuid", "name": "급한" }
      ],
      "createdAt": "2026-03-28T00:00:00Z",
      "updatedAt": "2026-03-28T00:00:00Z"
    }
  ]
}
```

#### POST /todos

요청:
```json
{
  "text": "할 일 텍스트",
  "categoryId": "uuid | null"
}
```

응답: 생성된 Todo 객체 (tags 빈 배열 포함)

#### PATCH /todos/:id

요청 (부분 업데이트):
```json
{
  "text": "수정된 텍스트",
  "completed": true,
  "categoryId": "uuid | null"
}
```

#### PATCH /todos/reorder

요청:
```json
{
  "orderedIds": ["uuid-3", "uuid-1", "uuid-2"]
}
```

서버에서 배열 인덱스 기반으로 sortOrder를 일괄 업데이트.

#### PUT /todos/:id/tags

요청:
```json
{
  "tagIds": ["uuid-1", "uuid-2"]
}
```

기존 태그를 모두 제거하고 전달된 tagIds로 교체.

---

#### Categories

| Method | Path | 설명 |
|--------|------|------|
| GET | `/categories` | 카테고리 목록 조회 |
| POST | `/categories` | 카테고리 생성 |
| PATCH | `/categories/:id` | 카테고리 수정 |
| DELETE | `/categories/:id` | 카테고리 삭제 |

#### POST /categories

요청:
```json
{
  "name": "카테고리 이름",
  "color": "#3B82F6"
}
```

제약: 사용자당 최대 10개, 동일 이름 중복 불가.

---

#### Tags

| Method | Path | 설명 |
|--------|------|------|
| GET | `/tags` | 태그 목록 조회 |
| POST | `/tags` | 태그 생성 |
| PATCH | `/tags/:id` | 태그 이름 수정 |
| DELETE | `/tags/:id` | 태그 삭제 |

#### POST /tags

요청:
```json
{
  "name": "태그 이름"
}
```

제약: 동일 이름 중복 불가.

---

### 3.3 에러 응답 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "텍스트는 필수입니다."
  }
}
```

에러 코드:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `CONFLICT` (409 — 중복 이름)
- `LIMIT_EXCEEDED` (400 — 카테고리 10개 초과)
- `INTERNAL_ERROR` (500)

---

## 4. 컴포넌트 구조 (Atomic Design)

### 4.1 Atoms (shadcn/ui 기반)
- Button, Input, Checkbox, Badge, DropdownMenu
- Dialog, Sheet (사이드 패널), Separator
- 디자인 토큰으로 커스텀 (globals.css)

### 4.2 Molecules
- `TodoInput` — 텍스트 입력 + 카테고리 선택 + 추가 버튼
- `TodoItem` — 체크박스 + 텍스트 + 카테고리 뱃지 + 태그 뱃지 + 더보기 메뉴 + 드래그 핸들
- `FilterGroup` — 상태 필터 토글 그룹
- `CategorySelect` — 카테고리 드롭다운
- `TagSelector` — 태그 멀티 선택 (필터용 / 편집용)
- `CategoryItem` — 카테고리 관리 행 (이름 + 색상 + 편집/삭제)
- `TagItem` — 태그 관리 행 (이름 + 편집/삭제)
- `ConfirmDialog` — 삭제 확인 다이얼로그

### 4.3 Organisms
- `TodoList` — TodoItem 목록 + @dnd-kit 드래그앤드롭 컨테이너
- `FilterBar` — FilterGroup + CategorySelect + TagSelector 조합
- `CategoryManager` — Sheet 내부에 CategoryItem 목록 + 추가 폼
- `TagManager` — Sheet 내부에 TagItem 목록 + 추가 폼
- `TagEditModal` — 특정 Todo의 태그 편집 다이얼로그

### 4.4 Templates
- `TodoPageLayout` — Header + TodoInput + FilterBar + TodoList + Footer

### 4.5 Pages
- `app/page.tsx` — TodoPageLayout + API 연동 (TanStack Query)

---

## 5. 상태 관리 전략

### 5.1 서버 상태 (TanStack Query)

| Query Key | 엔드포인트 | 비고 |
|-----------|-----------|------|
| `['todos', filters]` | GET /todos | 필터 변경 시 자동 리페치 |
| `['categories']` | GET /categories | |
| `['tags']` | GET /tags | |

### 5.2 Mutations + Optimistic Update

| Mutation | 엔드포인트 | Optimistic Update |
|----------|-----------|-------------------|
| createTodo | POST /todos | 목록 끝에 임시 항목 추가 |
| updateTodo | PATCH /todos/:id | 해당 항목 즉시 변경 |
| deleteTodo | DELETE /todos/:id | 해당 항목 즉시 제거 |
| deleteCompleted | DELETE /todos/completed | 완료 항목 즉시 제거 |
| reorderTodos | PATCH /todos/reorder | 드래그 결과 즉시 반영, 실패 시 롤백 |
| updateTodoTags | PUT /todos/:id/tags | 태그 즉시 변경 |

### 5.3 클라이언트 상태 (useState)

- `activeFilter`: 현재 상태 필터 (all / active / completed)
- `selectedCategoryId`: 선택된 카테고리 필터
- `selectedTagIds`: 선택된 태그 필터 목록
- `editingTodoId`: 현재 인라인 편집 중인 Todo ID
- `isCategoryPanelOpen`: 카테고리 관리 패널 열림 여부
- `isTagPanelOpen`: 태그 관리 패널 열림 여부

---

## 6. 모노레포 디렉토리 구조

```
todolist/
├── apps/
│   ├── web/                          # Next.js 16 프론트엔드
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css           # 디자인 토큰 (CSS Variables)
│   │   ├── components/
│   │   │   ├── atoms/                # shadcn/ui 래퍼 (필요시)
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
│   │   │   ├── useTodos.ts           # Todo CRUD + reorder mutations
│   │   │   ├── useCategories.ts
│   │   │   └── useTags.ts
│   │   ├── lib/
│   │   │   ├── api.ts                # fetch 래퍼 (base URL 설정)
│   │   │   └── query-client.ts       # TanStack Query 설정
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── server/                       # Express 백엔드
│       ├── src/
│       │   ├── index.ts              # Express 앱 엔트리
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
│       │   ├── constants.ts          # DEFAULT_USER_ID 등
│       │   └── prisma.ts            # Prisma Client 인스턴스
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                       # 프론트/백 공유 타입
│       ├── src/
│       │   ├── types/
│       │   │   ├── todo.ts
│       │   │   ├── category.ts
│       │   │   ├── tag.ts
│       │   │   └── api.ts            # API 요청/응답 타입, 에러 타입
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml
├── turbo.json
├── package.json                      # 루트 (workspace 설정)
├── pnpm-workspace.yaml
├── .env                              # DATABASE_URL 등
├── claude.md                         # Claude Code 컨텍스트
└── README.md
```

---

## 7. Docker Compose 구성

```yaml
# docker-compose.yml (참고용 스펙)
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
      - ./apps/server/src:/app/src    # 핫 리로드

  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [server]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000/api
    volumes:
      - ./apps/web:/app               # 핫 리로드
      - /app/node_modules

volumes:
  pgdata:
```

기동: `docker compose up -d`
전체 초기화: `docker compose down -v && docker compose up -d`

---

## 8. 개발 순서 (추천)

### Phase 1: 프로젝트 초기화
1. Turborepo + pnpm workspace 세팅
2. Docker Compose 작성 + DB 기동 확인
3. Express 서버 기본 구조 + Prisma 스키마 + 마이그레이션
4. 시드 데이터 실행
5. Next.js 16 프로젝트 세팅 + shadcn/ui 초기화

### Phase 2: 백엔드 API
6. Todo CRUD API
7. Category CRUD API
8. Tag CRUD API
9. Reorder API
10. Todo-Tag 연결 API

### Phase 3: 프론트엔드 기본
11. 디자인 토큰 정의 (globals.css)
12. TodoPageLayout 템플릿
13. TodoInput + TodoList + TodoItem (CRUD 연동)
14. 체크박스 토글 (완료/미완료)
15. 인라인 편집
16. 삭제 + 완료 항목 일괄 삭제

### Phase 4: 카테고리 + 태그
17. CategoryManager (사이드 패널)
18. CategorySelect (TodoInput 내 드롭다운)
19. TagManager (사이드 패널)
20. TagEditModal (할 일별 태그 편집)
21. FilterBar (상태 + 카테고리 + 태그 필터)

### Phase 5: 드래그앤드롭
22. @dnd-kit 세팅 + TodoList 드래그 구현
23. Optimistic Update + 실패 시 롤백
24. 모바일 터치 드래그 테스트

### Phase 6: 마무리
25. 반응형 점검 (360px ~ 1440px)
26. 키보드 접근성 점검
27. README.md 작성
28. 파이프라인 회고 (병목 구간, 개선점 기록)

---

## 9. 승인

| 역할 | 이름 | 상태 |
|------|------|------|
| 기획/개발 | Gentlee | 작성 완료, 검토 대기 |

> **다음 단계**: PRD 확정 후 디자인 토큰 정의 → v0 프로토타이핑 → 개발 착수