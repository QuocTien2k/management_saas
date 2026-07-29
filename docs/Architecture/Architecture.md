# Architecture Documentation

**Project:** Project Management SaaS  
**Frontend:** Next.js 15 / React 19 / TypeScript / Tailwind CSS / shadcn/ui  
**Backend:** NestJS / Prisma ORM / PostgreSQL  
**Storage:** Supabase Storage  
**Realtime:** Socket.IO  

---

# 1. Architecture Goals

| Goal | Approach |
|---|---|
| Scalability | Feature-based architecture allows adding new business features independently. |
| Maintainability | Clear separation between UI, business logic, and infrastructure. |
| Team Development | Business modules are isolated, reducing conflicts when multiple developers work together. |
| Testability | Business logic is separated into independent services for easier testing. |
| Security | Centralized authentication with JWT and authorization using RBAC. |
| Realtime Collaboration | Socket.IO provides instant updates for tasks, comments, and notifications. |
| Multi-tenancy | Workspace-based isolation protects organization data. |

**Architecture principle:**  
Prioritize clean separation, scalability, and long-term maintainability over minimal code structure.

---

# 2. Architecture Style

## Feature-Based Architecture

The system is organized by business features instead of technical layers.

Each feature contains its own:

- Controller
- Service
- DTO
- Validation
- Business logic

Main modules:

- Authentication
- Workspace
- Member
- Project
- Task
- Comment
- Notification
- Dashboard

Each module owns its responsibility and communicates through defined interfaces.

---

## Layered Architecture

The application follows a layered structure:

```

Presentation Layer
↓
Application Layer
↓
Domain Layer
↓
Infrastructure Layer
↓
Database

```

Rules:

- Higher layers can use lower layers.
- Lower layers must not depend on higher layers.
- UI components should not contain business logic.
- Controllers handle requests only.
- Services contain application logic.
- Database access is handled through Prisma.

---

# 3. High-Level Architecture

The system includes five main components:

```

```
          Browser
              │
              ▼
      Next.js Frontend
              │
    REST API / WebSocket
              │
              ▼
       NestJS Backend
      ┌──────────────┐
      │              │
      ▼              ▼
```

PostgreSQL       Supabase Storage

```

## Component Responsibilities

### Next.js Frontend

Handles:

- User interface
- Routing
- Authentication state
- API communication
- Form handling
- Realtime events
- Dashboard display

---

### NestJS Backend

Handles:

- Business logic
- Authentication
- Authorization
- API endpoints
- Validation
- WebSocket communication
- File processing

---

### PostgreSQL Database

Stores core application data:

- Users
- Workspaces
- Members
- Projects
- Tasks
- Comments
- Notifications

---

### Supabase Storage

Stores uploaded files:

- User avatars
- Workspace logos
- Task attachments

Database stores only:

- File metadata
- Storage path
- File URL

---

# 4. Folder Structure

## Frontend

```text
apps/web
│
├── app/                  # App Router
├── components/           # Shared UI
├── features/             # Business features
│   ├── auth/
│   ├── workspace/
│   ├── project/
│   ├── task/
│   ├── comment/
│   ├── notification/
│   └── dashboard/
│
├── hooks/                # Shared hooks
├── services/             # API clients
├── lib/                  # Utilities
├── providers/            # React providers
├── store/                # Global state
├── types/                # Shared types
└── constants/
```

---

## Backend

```text
apps/api
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── workspace/
│   │   ├── member/
│   │   ├── project/
│   │   ├── task/
│   │   ├── comment/
│   │   ├── notification/
│   │   └── dashboard/
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── exceptions/
│   │
│   ├── database/
│   ├── config/
│   ├── gateway/
│   └── main.ts
```

---

# 5. Layer Responsibilities

## Presentation Layer

Responsible for:

- Rendering UI
- Handling user interactions
- Form validation
- Navigation

Contains no business logic.

---

## Application Layer

Coordinates application flow.

Responsible for:

- Processing requests
- Calling services
- Returning responses

Examples:

- Controllers
- React Query hooks

---

## Domain Layer

Contains business rules.

Examples:

- Project management
- Task workflow
- Permission checks
- Notifications

---

## Infrastructure Layer

Integrates external services.

Examples:

- Prisma ORM
- PostgreSQL
- Supabase Storage
- Socket.IO

Contains no business logic.

---

## Shared Layer

Reusable code shared across features.

Includes:

- UI components
- Utilities
- Constants
- Shared types

Must remain feature-independent.

---

# 6. Communication Architecture

## REST Communication

Most client-server operations use REST APIs.

```text
Browser
    │
    ▼
Next.js
    │
HTTP
    │
    ▼
NestJS Controller
    │
Service
    │
Prisma
    │
PostgreSQL
```

Used for:

- Authentication
- CRUD operations
- Dashboard data
- File uploads
- Search and filtering

---

## Realtime Communication

Socket.IO delivers live updates.

```text
Client
    │
WebSocket
    │
    ▼
Gateway
    │
Service
    │
Database
```

Realtime events:

- Task updated
- Task assigned
- Comment added
- Notification created
- Member joined workspace

---

# 7. Authentication Architecture

Authentication uses JWT with Access Token and Refresh Token.

```text
User Login
      │
      ▼
Authentication Service
      │
Generate Tokens
      │
 ┌────┴────┐
 │         │
 ▼         ▼
Access   Refresh
Token    Token
 │         │
 │     HttpOnly Cookie
 │
 ▼
Protected APIs
```

Supports:

- User registration
- Login
- Logout
- Token refresh
- Password reset
- Google OAuth

Token storage:

- Access Token: Frontend
- Refresh Token: HttpOnly Cookie

---

# 8. Authorization Architecture

Authorization is based on Role-Based Access Control (RBAC).

Roles:

- Owner
- Admin
- Member

Every protected request follows this flow:

```text
Request
    │
Authentication
    │
Authorization Guard
    │
Permission Check
    │
Business Logic
```

Access is granted only to users with the required workspace role.

---

# 9. Workspace Isolation

The application uses a multi-tenant architecture.

Each workspace owns its own:

- Members
- Projects
- Tasks
- Comments
- Notifications

Every request verifies:

1. User identity
2. Workspace membership
3. User permission

This ensures data cannot be accessed across workspaces.

---

# 10. File Storage Architecture

Uploaded files are stored in Supabase Storage.

```text
User Upload
      │
      ▼
Next.js
      │
NestJS
      │
Supabase Storage
      │
Public URL
      │
Database Metadata
```

The database stores only:

- File name
- File size
- MIME type
- Storage path
- Public URL

File content is never stored in PostgreSQL.

---

# 11. Error Handling

Error handling is centralized in the backend.

Components:

- Validation Pipe
- Global Exception Filter
- Custom Business Exceptions
- HTTP Exception Mapping

Error flow:

```text
Request
    │
Validation
    │
Business Logic
    │
Exception Filter
    │
Standard JSON Response
```

All APIs return a consistent error format.

---

# 12. Deployment Architecture

Frontend and backend are deployed independently.

```text
                 Internet
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
     Vercel                 Railway
   Next.js App            NestJS API
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
 PostgreSQL Database     Supabase Storage
```

This architecture enables independent deployment and scaling of each service.

---

# 13. Security Considerations

Security measures include:

- Password hashing (bcrypt)
- JWT authentication
- Refresh Token rotation
- Role-Based Access Control (RBAC)
- Workspace isolation
- Input validation
- Secure file uploads
- CORS configuration
- Environment variable protection

All authentication, authorization, and business rules are enforced on the backend.

The frontend should never be trusted for authorization or security decisions.

---

# 14. Future Architecture

The modular architecture is designed to support future expansion.

Potential enhancements include:

- Redis caching
- Background jobs (BullMQ)
- Email service
- Subscription & Billing
- Audit logging
- Activity timeline
- Calendar integration
- AI-powered task assistant
- Microservices
- Analytics service

These features can be added with minimal impact on existing modules.