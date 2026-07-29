# PRD — Project Management SaaS

## 1. Problem Statement

Students, freelancers, and small teams often manage their work using multiple disconnected tools such as spreadsheets, messaging apps, and personal notes. This creates several common problems:

| Pain Point | Current Workaround | Why It Fails |
|---|---|---|
| Tasks are scattered across different apps | Write tasks in Notion, chat in Discord, schedule in Google Calendar | Difficult to track progress in one place |
| Team members don't know who is responsible | Ask through chat | Information is easily lost |
| No clear project progress | Manual checking | Time-consuming and inaccurate |
| No history of changes | Edit tasks directly | Difficult to know who changed what |
| Missing deadlines | Personal reminders | No centralized notification system |

**Project Management SaaS** provides a centralized workspace where teams can organize projects, manage tasks, collaborate in real time, and monitor progress from a single platform.

---

# 2. Target Users

### Primary

- University students working on group assignments
- Freelancers managing multiple clients
- Small software development teams (2–20 members)

### Secondary

- Startup teams
- Product managers
- UI/UX designers
- Software developers

### Environment

- Desktop browser
- Mobile responsive
- Internet connection required

---

# 3. Core Features — MVP (v1)

## F1 · Authentication

Users can create and access their accounts securely.

Features

- Sign Up
- Login
- Logout
- Forgot Password
- Reset Password
- Google Login
- JWT Authentication
- Refresh Token

---

## F2 · Workspace Management

A workspace represents a company or team.

Users can

- Create workspace
- Edit workspace
- Invite members
- Remove members
- Leave workspace
- View workspace information

Each workspace keeps all data isolated from other workspaces.

---

## F3 · Member & Role Management

Workspace owners can manage permissions.

Roles

- Owner
- Admin
- Member

Permissions determine what each user can access.

Examples

- Owner manages billing and workspace
- Admin manages projects and members
- Member works on assigned tasks

---

## F4 · Project Management

Users organize work into projects.

Features

- Create project
- Update project
- Archive project
- Delete project
- Project description
- Project icon
- Project color
- Project status

---

## F5 · Kanban Board

Each project contains a Kanban board.

Default columns

- Todo
- In Progress
- Review
- Done

Features

- Drag & Drop task
- Reorder task
- Create task quickly
- Move task between columns

Changes should update instantly.

---

## F6 · Task Management

Tasks are the core unit of work.

Each task contains

- Title
- Description
- Status
- Priority
- Due date
- Assignee
- Labels
- Attachments
- Checklist

Users can

- Create task
- Edit task
- Delete task
- Assign member
- Update status
- Upload files

---

## F7 · Comments

Members collaborate through task comments.

Features

- Create comment
- Edit own comment
- Delete own comment
- Mention another member
- Display comment history

---

## F8 · Notifications

Users receive notifications when important events occur.

Examples

- Assigned to task
- Mentioned in comment
- Task status changed
- Due date approaching
- Invited to workspace

Notifications appear in real time.

---

## F9 · Dashboard

Workspace dashboard provides an overview.

Displays

- Total projects
- Total tasks
- Completed tasks
- Overdue tasks
- Team productivity
- Recent activity

---

## F10 · Search & Filter

Users can quickly locate information.

Support

- Search project
- Search task
- Search member

Filters

- Status
- Priority
- Assignee
- Due date
- Labels

---

# 4. Out of Scope — v1

The following features will NOT be implemented in v1.

| Feature | Reason Deferred |
|---|---|
| Subscription & Billing | Planned for SaaS v2 |
| AI Task Generation | Future enhancement |
| Gantt Chart | MVP focuses on Kanban |
| Time Tracking | Added in later versions |
| Calendar Sync (Google Calendar) | External integration |
| Mobile Application | Web only |
| Offline Mode | Requires synchronization engine |
| Email Notifications | In-app notifications are sufficient |
| Video Meeting | Out of project scope |
| Public API | Internal APIs only |

---

# 5. Main User Flows

## Flow A — Create Workspace

```
User signs in
    → Creates a workspace
        → Workspace is created
            → User becomes Owner
                → Dashboard opens
```

---

## Flow B — Invite Team Members

```
Owner opens workspace
    → Opens Members page
        → Sends invitation
            → Member accepts invitation
                → Member joins workspace
```

---

## Flow C — Create Project

```
User opens workspace
    → Clicks "New Project"
        → Enters project information
            → Project created
                → Kanban board initialized
```

---

## Flow D — Manage Tasks

```
User opens project
    → Creates task
        → Assigns member
            → Moves task through workflow

Todo
    ↓
In Progress
    ↓
Review
    ↓
Done
```

---

## Flow E — Collaborate

```
Member opens task
    → Adds comment
        → Mentions teammate
            → Notification appears
                → Teammate replies
```

---

## Flow F — Track Progress

```
User opens Dashboard
    → Reviews project statistics
        → Identifies overdue tasks
            → Adjusts project planning
```

---

# 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First page load | < 3 seconds |
| API average response | < 500 ms |
| Authentication | JWT + Refresh Token |
| File Upload | Maximum 10 MB per file |
| Browser Support | Latest Chrome, Edge, Firefox |
| Responsive Design | Desktop first, Mobile supported |
| Data Isolation | Workspace data must be isolated |
| Security | Role-based access control (RBAC) |

---

# 7. Success Metrics (v1 Launch)

- User creates at least one workspace
- User creates at least one project
- User creates at least five tasks
- Workspace contains at least two members
- 80% of created tasks successfully move through the workflow
- Dashboard statistics update correctly after task changes

---

# 8. Constraints & Assumptions

- Multi-tenant architecture (workspace isolation)
- One user may belong to multiple workspaces
- Every task belongs to exactly one project
- Every project belongs to exactly one workspace
- Kanban is the primary project view in v1
- Real-time updates use WebSocket
- Files are stored in Supabase Storage
- Authentication uses JWT with Refresh Token
- Tech stack is fixed:

  - Next.js
  - NestJS
  - PostgreSQL
  - Prisma ORM
  - Supabase
  - Tailwind CSS
  - shadcn/ui
  - Socket.IO