# Implementation Plan

**Project:** Project Management SaaS  
**Version:** v1 (MVP)  
**Estimated Timeline:** 6 Weeks  
**Methodology:** Agile / Feature-Driven Development  

---

# 1. Overview & Strategy

This document outlines the step-by-step implementation plan to build the v1 MVP of the Project Management SaaS. 

The strategy follows a **Feature-Driven** approach. We will build the application slice by slice (vertically). Instead of building the entire database, then the entire API, then the entire UI, we will build complete features (e.g., Authentication, Workspace, Kanban Board) one at a time. This ensures that every completed sprint delivers a testable, working piece of the software.

**Key Guidelines for Execution:**
1. **Backend First per Feature:** Define the Prisma schema, build the REST APIs, and test them with Postman/Swagger before starting the UI.
2. **Strict Typing:** Share TypeScript interfaces (or Prisma generated types) between backend and frontend to ensure contract alignment.
3. **Continuous Integration:** Code should be pushed and merged frequently to avoid large merge conflicts.

---

# 2. Phase Breakdown

The project is divided into 5 main development phases, followed by a final deployment and polish phase.

| Phase | Focus Area | Duration | Goal |
|---|---|---|---|
| **Phase 1** | Foundation & Architecture | Week 1 | Repository setup, DB schema, CI/CD rules, basic routing. |
| **Phase 2** | Authentication & Workspaces | Week 2 | Users can log in, create workspaces, and invite members. |
| **Phase 3** | Core Kanban & Task Management | Week 3-4 | Users can create projects, manage tasks, and drag-and-drop. |
| **Phase 4** | Collaboration & Realtime | Week 5 | Socket.IO setup, comments, notifications, and file uploads. |
| **Phase 5** | Dashboard, Search & Deployment| Week 6 | Analytics, global search, and production release. |

---

# 3. Detailed Sprint Execution

## Phase 1: Foundation & Architecture (Week 1)

**Objective:** Set up the developer environment, initialize repositories, and establish the database connection.

### 1.1 Repository & Tooling Setup
- [ ] Initialize standard repository (or Monorepo).
- [ ] Set up ESLint, Prettier, and Husky pre-commit hooks.
- [ ] Configure environment variables (`.env`) for local development.

### 1.2 Backend Foundation (NestJS)
- [ ] Initialize NestJS project (`apps/api`).
- [ ] Install Prisma and initialize `schema.prisma`.
- [ ] Model the entire database schema (Users, Workspaces, Projects, Tasks, etc.).
- [ ] Run initial Prisma migration to local PostgreSQL database.
- [ ] Set up Global Exception Filter and Validation Pipe.
- [ ] Configure standard REST response interceptors.

### 1.3 Frontend Foundation (Next.js)
- [ ] Initialize Next.js 15 project (`apps/web`) with App Router.
- [ ] Install Tailwind CSS and configure `tailwind.config.ts`.
- [ ] Initialize `shadcn/ui` and install base components (Button, Input, Form, Toast).
- [ ] Set up Zustand (Global State) and React Query (Server State).
- [ ] Create basic folder structure (`features/`, `components/`, `lib/`, `services/`).

---

## Phase 2: Authentication & Workspaces (Week 2)

**Objective:** Secure the application and establish multi-tenant isolation.

### 2.1 Authentication Module
- **Backend:**
  - [ ] Implement `AuthService` (bcrypt hashing, JWT generation).
  - [ ] Create POST `/auth/register` and POST `/auth/login`.
  - [ ] Implement Refresh Token logic (HttpOnly cookies).
  - [ ] Create `JwtAuthGuard` to protect private routes.
- **Frontend:**
  - [ ] Build Login and Registration pages.
  - [ ] Implement Next.js middleware to protect private routes (redirect to `/login`).
  - [ ] Create Axios/Fetch interceptor to automatically attach Access Tokens and handle 401 refresh token flow.

### 2.2 Workspace & Member Management
- **Backend:**
  - [ ] Create Workspace CRUD APIs.
  - [ ] Implement `WorkspaceGuard` (checks `x-workspace-id` header and verifies user membership).
  - [ ] Create Member management APIs (Invite, Update Role, Remove).
- **Frontend:**
  - [ ] Build "Create Workspace" onboarding flow.
  - [ ] Build Workspace Settings UI (Members list, role dropdowns).
  - [ ] Implement invitation acceptance UI.
  - [ ] Build Sidebar component containing workspace selector.

---

## Phase 3: Core Kanban & Task Management (Week 3-4)

**Objective:** Deliver the primary value proposition: organizing and tracking work.

### 3.1 Project Module
- **Backend:**
  - [ ] Create Project CRUD APIs.
  - [ ] Implement default column generation (Todo, In Progress, Review, Done) when a project is created.
- **Frontend:**
  - [ ] Build Projects List view.
  - [ ] Build "Create Project" modal.

### 3.2 Task CRUD & Kanban Board
- **Backend:**
  - [ ] Create Task CRUD APIs.
  - [ ] Create PATCH `/tasks/:id/move` API to handle column changes and reordering.
- **Frontend:**
  - [ ] Build the Board View UI (Columns).
  - [ ] Integrate `@hello-pangea/dnd` for drag-and-drop functionality.
  - [ ] Build Task Card component.
  - [ ] Connect drag-and-drop events to the `/move` API (implement optimistic UI updates with React Query).

### 3.3 Task Details & Editing
- **Frontend:**
  - [ ] Build the "Task Detail Modal" (Intercepting Routes / Parallel Routes in Next.js).
  - [ ] Implement inline editing for Title, Description.
  - [ ] Implement Date Picker (shadcn calendar) for Due Date.
  - [ ] Implement Priority and Assignee dropdowns.

---

## Phase 4: Collaboration & Realtime (Week 5)

**Objective:** Make the application feel alive with instant updates and communication.

### 4.1 Realtime Infrastructure (Socket.IO)
- **Backend:**
  - [ ] Install `@nestjs/platform-socket.io`.
  - [ ] Create WebSocket Gateway.
  - [ ] Implement connection authentication (verify JWT in socket handshake).
  - [ ] Set up room joining logic (`join_workspace`, `join_project`).
- **Frontend:**
  - [ ] Initialize Socket.IO client singleton.
  - [ ] Create `useSocket` hook to listen to events and invalidate React Query caches automatically.

### 4.2 Comments & Mentions
- **Backend:**
  - [ ] Create Comment CRUD APIs.
  - [ ] Emit `comment_added` socket event.
- **Frontend:**
  - [ ] Build Comment list inside the Task Detail Modal.
  - [ ] Build rich text or markdown input for new comments.

### 4.3 File Attachments
- **Backend:**
  - [ ] Set up Supabase Storage bucket policies.
  - [ ] Create API to receive file, upload to Supabase, and save metadata to PostgreSQL.
  - [ ] Create Delete Attachment API.
- **Frontend:**
  - [ ] Build drag-and-drop file upload zone in Task Modal.
  - [ ] Display uploaded files with download links and image previews.

### 4.4 Notifications
- **Backend:**
  - [ ] Create Notification entity in DB.
  - [ ] Trigger notifications on specific events (assigned to task, mentioned).
  - [ ] Emit `notification` socket event to specific `user_{id}` room.
- **Frontend:**
  - [ ] Build Notification Bell dropdown in the top navigation bar.
  - [ ] Display unread count badge (update via socket).

---

## Phase 5: Dashboard, Search & Deployment (Week 6)

**Objective:** Polish the UX, provide high-level insights, and launch to production.

### 5.1 Dashboard & Analytics
- **Backend:**
  - [ ] Create GET `/dashboard/stats` API (aggregates task counts, completion rates).
- **Frontend:**
  - [ ] Build Dashboard page using Recharts or Tremor for visual charts (Tasks by status, upcoming deadlines).

### 5.2 Search & Filters
- **Backend:**
  - [ ] Add search and filter query parameters to Task and Project GET APIs.
- **Frontend:**
  - [ ] Build global search command palette (using `cmdk`).
  - [ ] Add filter dropdowns to the Kanban board (Filter by Assignee, Priority, Label).

### 5.3 Production Deployment (Direct, No Docker)
- **Database:**
  - [ ] Provision managed PostgreSQL database (e.g., Supabase DB or Neon).
  - [ ] Run production Prisma migrations (`npx prisma migrate deploy`).
- **Backend (API):**
  - [ ] Connect Railway (or Render) directly to the GitHub repository.
  - [ ] Configure build command (`npm run build`) and start command (`npm run start:prod`).
  - [ ] Inject production environment variables.
- **Frontend (Web):**
  - [ ] Connect Vercel to the GitHub repository.
  - [ ] Ensure `NEXT_PUBLIC_API_URL` points to the production backend.
  - [ ] Configure custom domain (optional).

---

# 4. Definition of Done (DoD)

For any single feature/task to be considered "Done", it must meet the following criteria:

1. **Code Complete:** Feature implemented according to requirements.
2. **Type Safe:** No TypeScript errors, `any` types minimized.
3. **Linted:** Code passes ESLint and Prettier checks.
4. **API Tested:** Endpoint tested manually via Postman or Swagger; returns correct status codes.
5. **UI Tested:** Feature works correctly in the browser without console errors.
6. **Responsive:** UI components do not break on mobile/tablet viewports.
7. **Code Reviewed:** Approved via Pull Request by at least one other developer.

---

# 5. Risk Management

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Drag & Drop complexity** | High | Start with a simple library (`@hello-pangea/dnd`). Implement robust API error handling to revert optimistic UI updates if the backend request fails. |
| **Realtime Sync Issues** | Medium | Do not rely strictly on sockets for data integrity. Use sockets to trigger a React Query `.invalidateQueries()` to fetch fresh data from the API securely. |
| **State Management Mess** | High | Strictly separate Server State (React Query) from Client State (Zustand). Never duplicate API data inside Zustand. |
| **Deployment CORS Errors** | Medium | Clearly define `ORIGIN` environment variables early. Ensure NestJS CORS configuration explicitly allows the Vercel frontend URL. |

---
End of Document
