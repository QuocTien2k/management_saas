# Coding Standards & Guidelines

**Project:** Project Management SaaS  
**Version:** v1  

---

# 1. Introduction

This document defines the coding standards, conventions, and best practices for the Project Management SaaS platform. 
Adhering to these standards ensures code consistency, reduces bugs, makes onboarding easier for new developers, and maintains the high quality required for a scalable SaaS product.

The primary rule: **Readability and maintainability over cleverness.**

---

# 2. General TypeScript Standards

Since the entire stack uses TypeScript, these rules apply globally.

## 2.1 Naming Conventions

- **Files and Directories:** Use `kebab-case` for all files and folders.
  - *Good:* `task-list.tsx`, `user.controller.ts`, `auth.service.ts`
  - *Bad:* `TaskList.tsx`, `userController.ts`
- **Variables & Functions:** Use `camelCase`.
  - *Good:* `const fetchUserData = () => {}`, `let totalCount = 0;`
- **Classes, Interfaces & Types:** Use `PascalCase`.
  - *Good:* `class TaskService`, `interface UserProfile`, `type WorkspaceRole = ...`
- **Constants:** Use `UPPER_SNAKE_CASE` for global/magic values.
  - *Good:* `const MAX_UPLOAD_SIZE = 10485760;`

## 2.2 Types vs Interfaces

- Use `interface` for defining object shapes, especially if they are going to be extended or implemented by classes.
- Use `type` for unions, intersections, and utility types.

```typescript
// Good
interface User {
  id: string;
  email: string;
}

// Good
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Avoid
type UserObject = { id: string, email: string };
```

## 2.3 Strict Typing

- **No `any`:** The use of `any` is strictly prohibited. Use `unknown` if the type is truly dynamic, and narrow it down later.
- **Avoid `@ts-ignore`:** Fix the underlying type issue instead of ignoring it. Use `@ts-expect-error` with a comment only if absolutely necessary.

---

# 3. Backend (NestJS) Standards

The backend must follow the strict layer-based architecture defined in `Architecture.md`.

## 3.1 Layer Separation

- **Controllers:** Handle HTTP requests, routing, and returning responses. They MUST NOT contain business logic.
- **Services:** Contain business rules, logic, and external calls. They MUST NOT access HTTP objects directly (`req`, `res`).
- **Prisma/Repositories:** Data access layer.

**Bad Controller (Logic mixed in):**
```typescript
@Post()
async createTask(@Body() data: CreateTaskDto) {
  if (data.priority === 'URGENT') {
    // Business logic in controller! BAD!
    await this.emailService.sendAlert();
  }
  return this.prisma.task.create({ data });
}
```

**Good Controller:**
```typescript
@Post()
async createTask(@Body() dto: CreateTaskDto) {
  return this.taskService.createTask(dto);
}
```

## 3.2 DTOs (Data Transfer Objects)

- Every incoming request with a body MUST be validated using a DTO.
- Use `class-validator` and `class-transformer` decorators.

```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
```

## 3.3 Error Handling

- Never throw generic `Error` objects. Use standard NestJS HTTP Exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`).
- Catch database errors in the service or a global filter, do not leak DB details to the client.

```typescript
// Good
async getTask(id: string) {
  const task = await this.prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }
  return task;
}
```

## 3.4 Prisma Best Practices

- Do not query the database inside loops.
- Use `.select` or `.include` to prevent over-fetching data.

```typescript
// Good
const workspaces = await this.prisma.workspace.findMany({
  where: { members: { some: { userId } } },
  select: { id: true, name: true, logoUrl: true } // Only fetch what is needed
});
```

---

# 4. Frontend (Next.js & React) Standards

## 4.1 Component Architecture

- Limit component size to **maximum 200 lines**. If it's larger, split it into smaller sub-components.
- Keep UI components separate from business logic (Smart vs. Dumb components).
- Use `lucide-react` for all icons.

## 4.2 Server vs Client Components

- By default, Next.js uses Server Components. Keep them server-rendered for initial data fetching.
- Add `'use client'` ONLY at the top of files that require interactivity (hooks, state, onClick events).
- Push `'use client'` as far down the component tree as possible.

**Good Structure:**
```tsx
// app/projects/page.tsx (Server Component)
import { ProjectList } from './_components/project-list';
import { fetchProjects } from '@/services/project-service';

export default async function ProjectsPage() {
  const data = await fetchProjects();
  return <ProjectList initialData={data} />;
}
```

```tsx
// app/projects/_components/project-list.tsx (Client Component)
'use client';
import { useState } from 'react';

export function ProjectList({ initialData }) {
  const [search, setSearch] = useState('');
  // Render interactive list...
}
```

## 4.3 Hooks and State

- Do not duplicate data in state if it can be derived during render.
- Use Custom Hooks to extract complex logic from components.

```tsx
// Bad
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const [fullName, setFullName] = useState('John Doe'); // Redundant state

// Good
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const fullName = `${firstName} ${lastName}`; // Derived during render
```

## 4.4 Tailwind CSS & Styling

- Avoid massive inline class strings. Use `clsx` and `tailwind-merge` (standard in shadcn/ui via the `cn()` utility) to compose classes cleanly.

```tsx
// Good
import { cn } from '@/lib/utils';

export function Button({ className, variant, ...props }) {
  return (
    <button 
      className={cn("px-4 py-2 rounded-md font-medium", {
        "bg-blue-500 text-white": variant === 'primary',
        "bg-gray-200 text-gray-900": variant === 'secondary',
      }, className)} 
      {...props} 
    />
  );
}
```

## 4.5 UI Language & Localization Standard
- **Primary Interface Language:** Vietnamese (`vi`).
- **All UI Labels:** Every text visible to the user (buttons, labels, placeholders, tooltips, toast notifications, status badges) MUST be written in Vietnamese by default.
  - *Examples:*
    - `Login` ➔ `Đăng nhập`
    - `Sign Up` ➔ `Đăng ký`
    - `Create Task` ➔ `Tạo công việc`
    - `In Progress` ➔ `Đang thực hiện`
    - `Cancel` ➔ `Hủy`

---

# 5. Git & Version Control Workflow

## 5.1 Branching Strategy

We follow a simplified GitFlow model.
- `main` / `master`: Production-ready code only.
- `develop`: Integration branch.
- Feature branches branch off `develop`.

**Branch Naming Convention:**
- `feature/short-description` (e.g., `feature/kanban-drag-drop`)
- `bugfix/short-description` (e.g., `bugfix/task-modal-crash`)
- `hotfix/short-description` (e.g., `hotfix/auth-token-bypass`)

## 5.2 Commit Messages (Conventional Commits)

Commit messages MUST follow the conventional commit format to allow automated changelog generation.

**Format:**
`<type>(<scope>): <subject>`

**Allowed Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons (no code logic change)
- `refactor`: Refactoring production code
- `test`: Adding missing tests
- `chore`: Updating build tasks, package managers

**Examples:**
- `feat(auth): implement JWT refresh token rotation`
- `fix(board): prevent tasks from disappearing during drag`
- `chore: update dependencies`

## 5.3 Pull Requests (PR)

- All code must be reviewed via PR.
- No direct commits to `main` or `develop`.
- PRs should be small and focused on a single task/feature.
- Squash and merge is preferred to keep the commit history clean.

---

# 6. Database Standards

*(Refer to `Database.md` for full details, this is a quick summary for coding)*

- All database tables must use `snake_case` plural names (e.g., `workspace_members`).
- All columns must use `snake_case` (e.g., `created_at`, `assigned_user_id`).
- Primary keys must be UUIDs, not integers.
- Boolean fields should be prefixed with `is_` or `has_` (e.g., `is_completed`).
- Never delete data permanently unless explicitly required. Always use soft deletes (`deleted_at`).

---

# 7. Code Review Checklist

Before approving a PR, reviewers should verify:
1. Does the code solve the problem efficiently?
2. Does it follow the established architecture (no logic in controllers, etc.)?
3. Are variable and function names descriptive and clear?
4. Are TypeScript types strictly defined (no `any`)?
5. Is the database queried efficiently (no N+1 query problems)?
6. Are errors handled gracefully and returned to the frontend correctly?
7. Did the developer run ESLint and Prettier?

---
