# Database Architecture

**Project:** Project Management SaaS  
**Database:** PostgreSQL (Managed by Supabase)  
**ORM:** Prisma ORM (v7+)  
**Storage:** Supabase Storage (File metadata in DB, binaries in Storage)

---

# 1. Core Design Principles

To ensure scalability and maintainability, the database strictly follows these rules:

- **Multi-Tenant Isolation:** Every business entity must trace back to a `Workspace`. No data is shared across workspaces.
- **UUID Primary Keys:** All tables use `UUID` (v4) for primary keys (`id`).
- **Standard Timestamps:** All business tables must include `created_at` and `updated_at` (TIMESTAMPTZ).
- **Soft Delete Strategy:** Business entities (Users, Workspaces, Projects, Tasks, Comments) use a `deleted_at` field. **Never hard delete** business data. Hard deletes are only permitted for temporary data (e.g., expired refresh tokens, invitations).
- **Naming Convention:** `snake_case` for all database tables and columns (mapped via Prisma `@map` and `@@map`).

---

# 2. Connection Strategy (Prisma v7+)

We utilize Supabase's connection pooling. Configuration is strictly managed in `prisma.config.ts` (not inside `schema.prisma`):

- **DATABASE_URL (Port 6543):** Transaction-mode pooler. Used for Prisma Client in the application code.
- **DIRECT_URL (Port 5432):** Session-mode connection. Used EXCLUSIVELY for Prisma Migrate (`prisma db push` / `prisma migrate dev`).

---

# 3. Core Domain Entities & Relationships

Instead of listing every field, this section defines the strict hierarchical boundaries of the system.

### 3.1 Authentication & Tenancy
- **User:** The root account. Can belong to multiple workspaces.
- **Workspace:** The tenant boundary.
- **WorkspaceMember:** The junction table connecting `User` and `Workspace`. Contains RBAC roles (Owner, Admin, Member). All authorization checks run against this table.
- **WorkspaceInvitation:** Manages pending invites to a workspace.

### 3.2 Project Management
- **Project:** Belongs to exactly ONE `Workspace`.
- **ProjectColumn:** Belongs to exactly ONE `Project`. Defines the Kanban workflow (Todo, In Progress, Done).
- **Task:** Belongs to exactly ONE `Project` and sits inside ONE `ProjectColumn`. Assigned to ONE `WorkspaceMember`.

### 3.3 Task Details & Collaboration
- **Comment:** Belongs to ONE `Task`.
- **Attachment:** Metadata belongs to ONE `Task`. Actual file is in Supabase Storage.
- **Checklist & Items:** Breakdowns within a `Task`.
- **TaskLabel:** Created at the `Workspace` level, assigned to `Tasks` via a many-to-many junction table.

### 3.4 Realtime & Events
- **Notification:** Triggered by system events (mentions, assignments). Stored in DB for history, broadcasted via Socket.IO. Belongs to ONE `User`.

---

# 4. Cascade & Constraint Rules

To prevent accidental data loss, foreign key cascade behaviors are strictly regulated:

- **RESTRICT (Prevent Deletion):** Used for critical business hierarchies.
  - `Workspace` -> `Projects`
  - `Project` -> `Tasks`
  - `Task` -> `Comments`
- **CASCADE (Auto Delete):** Used ONLY for tight parent-child dependencies or junction tables.
  - `User` -> `RefreshTokens`
  - `Workspace` -> `WorkspaceMembers`
  - `Task` -> `TaskLabelRelations`
  - `Checklist` -> `ChecklistItems`
- **SET NULL:** Used for optional relationships (e.g., `assigned_user_id` on a Task if the user leaves the workspace).

---

# 5. Migration Workflow

- The `schema.prisma` file is the **single source of truth** for database structure.
- **NEVER** modify tables manually in the Supabase Dashboard.
- **Workflow:** Modify `.prisma` -> Run `npx prisma format` -> Run `npx prisma migrate dev` -> Generate Client.