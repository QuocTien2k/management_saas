# Tech Stack Documentation

**Project:** Project Management SaaS  
**Version:** v1  

---

# 1. Overview

This document outlines the technology stack chosen for the Project Management SaaS platform. 
The selection is heavily biased toward TypeScript for full-stack type safety, React/Next.js for 
a highly interactive user interface, and NestJS for a structured, scalable backend architecture.

By standardizing on TypeScript across both frontend and backend, we enable code reuse (such as 
shared types and DTOs) and reduce context switching for full-stack developers.

---

# 2. Core Stack Summary

| Layer | Technology | Primary Purpose |
|---|---|---|
| **Language** | TypeScript (v5.x) | Static typing, interface definitions |
| **Frontend Framework** | Next.js 15 (App Router) | React framework, SSR/CSR, routing |
| **UI Library** | React 19 | Component building, hooks |
| **Styling** | Tailwind CSS v3/v4 | Utility-first CSS styling |
| **UI Components** | shadcn/ui | Accessible, unstyled component primitives |
| **Backend Framework** | NestJS (v10.x) | Scalable backend architecture, API endpoints |
| **Database** | PostgreSQL (v15+) | Primary relational data store |
| **ORM** | Prisma ORM | Database schema management and querying |
| **Storage** | Supabase Storage | File and asset storage (S3 compatible) |
| **Realtime** | Socket.IO | Bi-directional event-based communication |

---

# 3. Frontend Engineering

The frontend is built to be fast, responsive, and highly interactive, resembling a desktop application more than a traditional website.

## 3.1 Next.js 15 (App Router)
- **Why:** Next.js provides a robust file-system-based router (`app` directory) and native support for Server Components.
- **Usage:** Server Components are used for initial data fetching and SEO-sensitive pages. Client Components (`"use client"`) are heavily used in the Kanban board and interactive task modals.

## 3.2 React 19
- **Why:** The latest React version provides optimized rendering and modern hooks.
- **Usage:** Managing local component state, context, and DOM refs for the drag-and-drop interfaces.

## 3.3 State Management & Data Fetching
- **Server State:** `@tanstack/react-query` (React Query)
  - Handles API fetching, caching, synchronization, and optimistic UI updates (e.g., instantly updating the UI when a task is moved while the backend request is pending).
- **Client State:** `Zustand`
  - A lightweight, unopinionated state management library used for global UI states (e.g., active sidebar item, global modal states, theme preferences).

## 3.4 Styling & UI Components
- **Tailwind CSS:** Enables rapid UI development without context-switching to CSS files. Ensures a consistent design token system.
- **shadcn/ui:** Provides a set of high-quality, accessible UI components (Radix UI under the hood) that we can own and customize directly in our codebase.
- **Lucide React:** Icon library for consistent, lightweight SVG icons.

## 3.5 Drag and Drop
- **Library:** `@hello-pangea/dnd` (or similar modern DnD library compatible with React strict mode).
- **Usage:** Powering the Kanban board column ordering and task movement.

---

# 4. Backend Engineering

The backend requires a strong architectural foundation to handle multi-tenant business logic, complex authorization rules, and realtime events.

## 4.1 NestJS
- **Why:** NestJS enforces an Angular-like architecture (Modules, Controllers, Services) out of the box, preventing spaghetti code and promoting separation of concerns.
- **Usage:** Building RESTful APIs, dependency injection, role-based access control (RBAC) via Guards, and data validation via Pipes.

## 4.2 API Validation
- **Library:** `class-validator` and `class-transformer`.
- **Usage:** Validating incoming HTTP requests and WebSocket payloads against defined Data Transfer Objects (DTOs) before they hit the business logic.

## 4.3 Authentication
- **Strategy:** JWT (JSON Web Tokens).
- **Libraries:** `@nestjs/jwt`, `passport`, `bcrypt`.
- **Usage:** Generating short-lived Access Tokens (passed in headers) and long-lived Refresh Tokens (stored in HttpOnly cookies).

## 4.4 Realtime WebSocket
- **Library:** `@nestjs/platform-socket.io` (Socket.IO).
- **Usage:** Broadcasting task updates, new comments, and notifications to connected clients. Features built-in support for Namespaces and Rooms (perfect for workspace-level event isolation).

---

# 5. Database & Infrastructure

## 5.1 PostgreSQL (Managed by Supabase)
- **Why:** Industry standard for relational data. Supabase provides a powerful, scalable PostgreSQL database out of the box, with built-in connection pooling and automated backups.
- **Usage:** Primary data store for all business entities (Users, Workspaces, Projects, Tasks, etc.).

## 5.2 Prisma ORM (v7+)
- **Why:** Provides the best TypeScript developer experience with strict typing and auto-generated clients based on the `.prisma` schema.
- **Usage:** Database migrations, type-safe queries, and relation management.
- **Important Configuration Note:** We are using Prisma v7+. Connection URLs are configured via `prisma.config.ts` (not `schema.prisma`). We utilize two distinct connections:
  - `DATABASE_URL`: Supabase Transaction-mode pooler (IPv4) for Prisma Client (optimized for serverless/high concurrency).
  - `DIRECT_URL`: Supabase Session-mode connection for Prisma Migrate (structural changes).

## 5.3 Supabase Storage
- **Why:** Avoids the complexity of setting up raw AWS S3 buckets. Provides a clean API and dashboard seamlessly integrated with our PostgreSQL database.
- **Usage:** Storing user avatars, workspace logos, and task attachments.

---

# 6. Tooling & DevOps

Maintaining code quality and a smooth deployment pipeline is critical for team collaboration.

## 6.1 Code Quality
- **ESLint:** Lints TypeScript code to catch errors and enforce best practices.
- **Prettier:** Opinionated code formatter to ensure a consistent code style across the entire repository.
- **Husky & lint-staged:** Git hooks to automatically format and lint code before a commit is allowed.

## 6.2 Monorepo Management (Optional but Recommended)
- **Tool:** Turborepo or npm/yarn workspaces.
- **Usage:** Managing the `frontend`, `backend`, and `shared` (types/DTOs) packages within a single repository for easier synchronization.

## 6.3 Deployment
- **Frontend Hosting:** Vercel (Native support for Next.js, Edge functions, caching).
- **Backend Hosting:** Railway, Render, or similar PaaS for Dockerized Node.js applications.
- **Database Hosting:** Supabase (Managed PostgreSQL, Authentication, and Storage).

---

# 7. Summary of Justifications

1. **Why not MongoDB?** 
   - A SaaS platform heavily relies on relationships (User belongs to Workspace, Task belongs to Project, etc.). Relational databases (PostgreSQL) handle this natively and safely.
2. **Why not Express.js?**
   - Express is too unopinionated. For a scalable SaaS, NestJS provides the necessary structure, dependency injection, and modularity out of the box.
3. **Why Next.js App Router?**
   - It is the future of React. Server components allow us to securely fetch data and reduce client-side bundle sizes.

---
