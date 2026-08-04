<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=230&text=Project%20Management%20SaaS&fontSize=42&fontAlignY=38&color=0:6366f1,50:8b5cf6,100:ec4899&fontColor=ffffff&desc=Multi-Tenant%20Workspace%20%7C%20Realtime%20Kanban%20%7C%20Agile%20Management&descSize=18&descAlignY=62"/>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,nestjs,ts,postgres,prisma,tailwind,socketio,vercel&perline=9"/>
</p>

<p align="center">

[![Frontend App](https://img.shields.io/badge/Frontend_App-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://management-saas-rosy.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://management-saas-o65m.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS_10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

</p>

> A modern, centralized Project & Task Management Platform (Multi-tenant SaaS Workspace) designed for students, freelancers, and small software development teams (2–20 members).

---

## 🔗 Live Demo Links

- **Frontend App**: [https://management-saas-rosy.vercel.app/](https://management-saas-rosy.vercel.app/)
- **Backend API**: [https://management-saas-o65m.onrender.com](https://management-saas-o65m.onrender.com)

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Architecture](#-project-architecture)
4. [Backend Structure](#-backend-structure)
5. [Frontend Structure](#-frontend-structure)
6. [Core Features (MVP v1)](#-core-features-mvp-v1)
7. [Getting Started & Setup](#-getting-started--setup)
8. [Documentation Index](#-documentation-index)
9. [Development Workflow with AI Agent Router (.agents)](#-development-workflow-with-ai-agent-router-agents)

---

## 🎯 Project Overview

In real-world scenarios, students and small development teams often manage work using multiple disconnected tools (e.g., Notion/Excel for task tracking, Discord/Zalo for chatting, Google Calendar for schedules). This fragmentation leads to lost information, unclear project progress, and a lack of role-based permissions.

**Project Management SaaS** solves this by providing a unified, centralized workspace that enables teams to:
- Organize projects and manage tasks visually using interactive Kanban boards.
- Collaborate in real time (instant task drag-and-drop, task comments, live notifications).
- Isolate organization data across multiple workspaces (Multi-tenancy).
- Enforce strict access control based on user roles (Role-Based Access Control - RBAC).

---

## 🛠 Tech Stack

### Frontend Engine
- **Framework**: Next.js 15 (App Router) & React 19
- **Language**: TypeScript (v5.x)
- **Styling & UI Components**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: Lucide React
- **Client State Management**: Zustand (Global UI, Modal, Sidebar)
- **Server State & Caching**: TanStack Query v5 (`@tanstack/react-query`)
- **Kanban Drag & Drop**: `@hello-pangea/dnd`
- **Realtime Client**: Socket.IO Client

### Backend Engine
- **Framework**: NestJS (v10.x) - Modular architecture (Modules, Controllers, Services, Guards, Pipes)
- **Database ORM**: Prisma ORM (v7+)
- **Database**: PostgreSQL (Managed by Supabase)
- **Realtime Gateway**: `@nestjs/platform-socket.io` (Socket.IO)
- **Auth & Security**: JWT (Access Token & HttpOnly Cookie Refresh Token), Passport, bcrypt
- **Data Validation**: `class-validator` & `class-transformer`

### Cloud & Storage
- **File Attachment Storage**: Supabase Storage (S3-compatible)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render

---

## 🏗 Project Architecture

The system follows a **Feature-Based & Layered Architecture**, providing clean separation between the User Interface, Business Logic, and Infrastructure layers.

### 1. High-Level Architecture Diagram

```text
               ┌────────────────────────┐
               │    Browser Client      │
               └───────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    REST API (HTTPS)             WebSocket (WSS)
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │     NestJS Backend     │
               └───────────┬────────────┘
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│ PostgreSQL DB   │                 │ Supabase        │
│ (Prisma ORM v7) │                 │ File Storage    │
└─────────────────┘                 └─────────────────┘
```

### 2. Layered Architecture Breakdown

- **Presentation Layer**: Next.js Client Components (Form validation, DnD Kanban, UI components). Contains no business logic.
- **Application Layer**: NestJS Controllers handling incoming HTTP Requests, delegating to Services, and returning standardized JSON responses.
- **Domain Layer**: NestJS Services executing business logic (Permission checks, task state transitions, notifications, realtime event emission).
- **Infrastructure Layer**: Integrations with Prisma ORM (Database access), Socket.IO Gateways, and Supabase Storage Client.

### 3. Multi-Tenant Workspace Isolation

Every domain entity (Projects, Tasks, Members, Comments, Notifications) is strictly scoped to a `workspace_id`.
Every incoming request passes through NestJS **Guards**:
1. **User Identity Check**: JWT authentication verification.
2. **Workspace Membership Check**: Verifies user belongs to the target workspace.
3. **Permission Check**: Enforces Role-Based Access Control (RBAC: `Owner`, `Admin`, `Member`).

### 4. Authentication Architecture Flow
- **Access Token**: Short-lived JWT (15–60 minutes), transmitted via `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived JWT (7 days), stored securely in an `HttpOnly`, `SameSite=Strict` cookie.

---

## 📁 Backend Structure

The `backend/` directory is organized as a NestJS **Modular Monolith**:

```text
backend/
├── prisma/
│   ├── schema.prisma          # Entity definitions, Enums & Database Models
│   └── migrations/            # Database migration history
├── src/
│   ├── common/                # Shared utilities & middlewares
│   │   ├── decorators/        # Custom Decorators (@CurrentUser, @Roles)
│   │   ├── filters/           # Global Exception Filters (Standardized JSON errors)
│   │   ├── guards/            # Auth Guard, Roles Guard, Workspace Access Guard
│   │   ├── interceptors/     # Logging & Response Transform Interceptors
│   │   └── pipes/             # Validation Pipe (class-validator)
│   │
│   ├── config/                # Environment variables configuration
│   ├── database/              # Prisma Service & Database Connection Provider
│   ├── gateway/               # Socket.IO Gateway (Realtime WebSocket Handler)
│   │
│   ├── modules/               # Core Feature Modules
│   │   ├── auth/              # Sign Up, Login, Refresh Token, Google OAuth
│   │   ├── workspace/         # Workspace CRUD & Member Invitations
│   │   ├── member/            # Member management & Role assignment
│   │   ├── project/           # Project CRUD, Archiving & Color Customization
│   │   ├── task/              # Task CRUD, Kanban Order, Sub-tasks & Attachments
│   │   ├── comment/           # Task Comments & Member Mentions (@member)
│   │   ├── notification/      # Realtime Notification management & broadcasting
│   │   └── dashboard/         # Workspace Metrics & Productivity Aggregations
│   │
│   ├── app.module.ts          # Root Module wiring all sub-modules
│   └── main.ts                # Application entry point (CORS, Pipes, Port)
│
├── .env.example               # Environment variables template
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 📁 Frontend Structure

The `frontend/` directory is built on top of **Next.js 15 App Router** using a feature-driven layout:

```text
frontend/
├── src/
│   ├── app/                   # App Router Pages & Routes
│   │   ├── (auth)/            # Authentication route group (login, register, forgot-password)
│   │   ├── (dashboard)/       # Workspace Dashboard route group
│   │   │   ├── workspaces/    # Workspace switcher & list
│   │   │   ├── projects/      # Project details & Kanban board
│   │   │   ├── tasks/         # Personal task views
│   │   │   ├── members/       # Workspace members & permissions
│   │   │   └── settings/      # Workspace & Account Settings
│   │   ├── api/               # Next.js Route Handlers (if needed)
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Landing Page
│   │
│   ├── components/            # Shared UI Components
│   │   ├── ui/                # shadcn/ui primitives (button, dialog, input, card, dropdown...)
│   │   ├── common/            # Navbar, Sidebar, Loading Spinner, Confirm Modal
│   │   └── kanban/            # Board, Column, TaskCard, DragHandle components
│   │
│   ├── features/              # Feature-specific Components & Logic
│   │   ├── auth/              # Login, register, and password reset forms
│   │   ├── workspace/         # Workspace creation dialog & workspace switcher
│   │   ├── project/           # Project modal & color pickers
│   │   ├── task/              # Task details modal, checklist, attachments
│   │   └── comment/           # Comment input & comment thread list
│   │
│   ├── hooks/                 # Custom React Hooks (useAuth, useSocket, useDebounce...)
│   ├── lib/                   # Utility functions (cn helper, axios client, formatters)
│   ├── providers/             # React Context Providers (QueryClientProvider, ThemeProvider, SocketProvider)
│   ├── services/              # API Client Services (backend REST endpoint callers)
│   ├── store/                 # Global Client State Stores via Zustand (useUserStore, useUIStore)
│   └── types/                 # Shared TypeScript Interfaces & Types
│
├── public/                    # Static Assets (Logos, Icons, Placeholders)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ⚡ Core Features (MVP v1)

| Code | Feature | Description |
|---|---|---|
| **F1** | **Authentication** | Sign Up, Login, Logout, Refresh Token, Reset Password, Google OAuth. |
| **F2** | **Workspace Management** | Create, rename, update logo, and switch between workspaces seamlessly. |
| **F3** | **Member & Role Management** | Invite members via Email, remove members, manage roles (`Owner`, `Admin`, `Member`). |
| **F4** | **Project Management** | Create projects, archive completed projects, set custom icons and color tags. |
| **F5** | **Interactive Kanban Board** | 4 default columns (*Todo*, *In Progress*, *Review*, *Done*). Realtime drag-and-drop task movement. |
| **F6** | **Task Management** | Task creation/editing, Labels, Priorities (Low/Medium/High/Urgent), Due Dates, Assignees, Sub-task Checklists. |
| **F7** | **Comments & Mentions** | In-task discussions, file attachments, and `@mention` notifications to team members. |
| **F8** | **Realtime Notifications** | Live Socket.IO alerts when assigned to tasks, mentioned in comments, or when board status changes. |
| **F9** | **Dashboard & Reporting** | Summary charts for total projects, completed tasks, overdue tasks, and team productivity. |
| **F10** | **Search & Filtering** | Fast global search for tasks/projects/members. Advanced filtering by Priority, Status, Assignee, and Due Date. |

---

## 🚀 Getting Started & Setup

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**, **yarn**, or **pnpm**
- **PostgreSQL Database** (or a Supabase connection string)

---

### 1. Backend Setup (`backend/`)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env
```

Configure parameters in `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/management_saas?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/management_saas?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
FRONTEND_URL="http://localhost:3000"
```

Run Database Migrations & Start Backend:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start NestJS dev server
npm run start:dev
```
Backend API will be running at: `http://localhost:5000`

---

### 2. Frontend Setup (`frontend/`)

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file from template
cp .env.example .env.local
```

Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

Start Frontend Application:
```bash
# Start Next.js dev server
npm run dev
```
Frontend UI will be ready at: `http://localhost:3000`

---

## 📚 Documentation Index

All standardized technical documentation is located in the [`docs/`](file:///g:/vibe_antigravity/management_saas/docs) folder:

- 📋 [**Product Requirement Document (PRD)**](file:///g:/vibe_antigravity/management_saas/docs/Product.md): Business goals, target users, user flows, and MVP scope.
- 🏗 [**Architecture Documentation**](file:///g:/vibe_antigravity/management_saas/docs/Architecture/Architecture.md): Detailed layered architecture, REST vs Realtime, security & data isolation.
- 🗄 [**Database Documentation**](file:///g:/vibe_antigravity/management_saas/docs/Architecture/Database.md): Entity relationship diagrams (ERD), schema definitions, and index strategies.
- 🔌 [**API Specification**](file:///g:/vibe_antigravity/management_saas/docs/Architecture/API.md): RESTful API standards, endpoint listings, and request/response DTOs.
- 💻 [**Tech Stack Specification**](file:///g:/vibe_antigravity/management_saas/docs/Development/Tech-Stack.md): Technology selection rationales, auxiliary libraries, and deployment infrastructure.
- 🎨 [**Coding Standards**](file:///g:/vibe_antigravity/management_saas/docs/Development/Coding-Standards.md): Naming conventions, TypeScript standards, linting rules, and error handling patterns.
- 🗺 [**Implementation Plan**](file:///g:/vibe_antigravity/management_saas/docs/Plan/Implementation-Plan.md): Project development roadmap and execution phases.

---

## 🤖 Development Workflow with AI Agent Router (.agents)

The project includes an **AI Agent Router** setup in [`.agents/`](file:///g:/vibe_antigravity/management_saas/.agents) to guide AI coding assistants according to project documentation:

| Trigger Workflow | Purpose |
|---|---|
| `catchup` | Restores full project context after interruption or session restart. |
| `plan` | Analyzes requirements and drafts an implementation plan aligned with docs. |
| `implement` | Coordinates skills (`build-database`, `build-api`, `build-ui`) to generate accurate code. |
| `fix` | Diagnoses root causes from error logs and applies architecture-compliant patches. |
| `ship` | Performs pre-commit code reviews, lint checks, and suggests Conventional Commit messages. |

---

<p align="center">
  Developed with ❤️ for efficient team project management.
</p>
