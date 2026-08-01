# API Documentation

**Project:** Project Management SaaS  
**Version:** v1  
**Base URL:** `/api/v1`  
**Protocol:** RESTful & WebSocket (Socket.IO)  

---

# 1. API Design Principles

| Principle | Description |
|---|---|
| **RESTful** | Uses standard HTTP methods (GET, POST, PUT, PATCH, DELETE) for all core business operations. |
| **Stateless** | Each request must contain all necessary authentication state (JWT). |
| **JSON Only** | All requests and responses use `application/json` (except file uploads). |
| **Versioning** | All endpoints are prefixed with `/api/v1` to allow future backward-compatible changes. |
| **Casing** | Requests and JSON responses strictly follow `camelCase`. |

---

# 2. Authentication & Authorization

## 2.1 Authentication

The API uses JWT (JSON Web Tokens) with a dual-token architecture.

- **Access Token:** Sent in the `Authorization` header as a Bearer token.
- **Refresh Token:** Stored securely in an `HttpOnly` cookie to prevent XSS attacks.

**Header Format:**
```http
Authorization: Bearer <your_access_token>
```

## 2.2 Authorization (RBAC)

Because the system uses a multi-tenant architecture, most endpoints require workspace-level authorization.

**Required Header for Workspace APIs:**
```http
x-workspace-id: <workspace_uuid>
```

The NestJS backend `Authorization Guard` verifies if the authenticated user has the required role (Owner, Admin, Member) in the specified workspace before processing the request.

---

# 3. Standard Response Format

All APIs follow a consistent response structure to simplify frontend parsing and error handling.

## 3.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```
*(Note: The `meta` object is only included for paginated list endpoints).*

## 3.2 Error Response

Centralized exception filters map all backend errors to a uniform format.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["email must be a valid email", "password is too short"]
  }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation (DTO) or business logic error.
- `401 Unauthorized`: Missing, invalid, or expired access token.
- `403 Forbidden`: Insufficient workspace permissions.
- `404 Not Found`: Resource does not exist or belongs to another workspace.
- `500 Internal Server Error`: Unhandled backend exception.

---

# 4. Pagination, Filtering & Sorting

List endpoints utilize query parameters for precise data control.

**Standard Query Parameters:**
- `page` (default: 1): The current page number.
- `limit` (default: 20): Number of items per page.
- `sortBy` (default: `createdAt`): Entity field to sort by.
- `order` (default: `desc`): Sort direction (`asc` or `desc`).
- `search`: Keyword for full-text search across relevant text fields.

**Example Request:**
`GET /api/v1/workspaces/123/tasks?status=IN_PROGRESS&limit=10&page=2`

---

# 5. REST API Endpoints

The endpoints are organized by feature modules, strictly following the backend folder structure.

## 5.1 Authentication Module

Handles identity verification and token generation.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | No |
| POST | `/auth/login` | Authenticate user, return tokens | No |
| POST | `/auth/logout` | Invalidate refresh token | Yes |
| POST | `/auth/refresh` | Issue new access token | Cookie |
| POST | `/auth/google` | OAuth login with Google | No |

## 5.2 Workspace Module

Handles tenant management and data isolation boundaries.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| POST | `/workspaces` | Create a new workspace | Any User |
| GET | `/workspaces` | List all workspaces the user belongs to | Any User |
| GET | `/workspaces/:id` | Get specific workspace details | Member |
| PATCH | `/workspaces/:id` | Update workspace settings/logo | Owner, Admin |
| DELETE | `/workspaces/:id` | Soft delete workspace | Owner |

## 5.3 Member Module

Manages Workspace RBAC and the invitation lifecycle.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| GET | `/workspaces/:id/members` | List all workspace members | Member |
| POST | `/workspaces/:id/invitations`| Send workspace invitation via email | Admin, Owner |
| POST | `/invitations/accept` | Accept an invitation (returns tokens) | Any (Valid token)|
| PATCH | `/workspaces/:id/members/:uid`| Change member role | Owner |
| DELETE | `/workspaces/:id/members/:uid`| Remove member from workspace | Admin, Owner |

## 5.4 Project Module

Organizes work inside a workspace. *(Requires `x-workspace-id` header)*.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| POST | `/projects` | Create a new project | Admin, Owner |
| GET | `/projects` | List projects in workspace | Member |
| GET | `/projects/:id` | Get project details & board columns | Member |
| PATCH | `/projects/:id` | Update project (name, icon, status) | Admin, Owner |
| DELETE | `/projects/:id` | Archive or soft delete project | Admin, Owner |

## 5.5 Task Module

The core entity. *(Requires `x-workspace-id` header)*.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| POST | `/projects/:id/tasks` | Create a new task | Admin, Owner |
| GET | `/projects/:id/tasks` | Get tasks mapped to columns (Kanban) | Member |
| GET | `/tasks/:id` | Get detailed task info | Member |
| PATCH | `/tasks/:id` | Update task (Member: status only; Owner/Admin: full) | Member |
| DELETE | `/tasks/:id` | Soft delete task | Admin, Owner |
| PATCH | `/tasks/:id/move` | Update task position & column | Member |

## 5.6 Comment Module

Task discussions and collaboration.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| POST | `/tasks/:id/comments` | Add a comment to task | Member |
| GET | `/tasks/:id/comments` | List task comments with history | Member |
| PATCH | `/comments/:id` | Edit own comment | Comment Author|
| DELETE | `/comments/:id` | Soft delete own comment | Comment Author|

## 5.7 File Upload (Supabase Storage)

File metadata is stored in PostgreSQL; binary data is streamed to Supabase.

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| POST | `/tasks/:id/attachments` | Upload file (`multipart/form-data`) | Member |
| DELETE | `/attachments/:id` | Delete file from DB & Supabase | Member |

## 5.8 Dashboard & Notifications

Aggregated data and user alerts.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/dashboard/stats` | Get workspace metrics (tasks, progress)| Member |
| GET | `/notifications` | List user's recent notifications | Yes |
| PATCH | `/notifications/:id/read`| Mark single notification as read | Yes |
| PATCH | `/notifications/read-all`| Mark all notifications as read | Yes |

---

# 6. Realtime API (WebSocket / Socket.IO)

Realtime communication is strictly used for instant UI updates. The Next.js frontend connects to the NestJS Socket.IO gateway using the Access Token.

## 6.1 Connection & Rooms

- **Authentication:** Token is passed and verified during the WebSocket handshake.
- **Rooms:** Clients dynamically join rooms to receive isolated events.
  - `workspace_{id}`: Events affecting the whole workspace (e.g., new member joined).
  - `project_{id}`: Events within a project board (e.g., task moved, created).
  - `user_{id}`: Personal events (e.g., direct task assignment, mentions).

## 6.2 Client to Server Events (Emits)

| Event Name | Payload | Description |
|---|---|---|
| `join_workspace` | `{ workspaceId }` | Subscribes client to workspace events. |
| `join_project` | `{ projectId }` | Subscribes client to project board events. |
| `leave_project`| `{ projectId }` | Unsubscribes client to save resources. |

## 6.3 Server to Client Events (Listeners)

| Event Name | Payload Example | Target Room | Description |
|---|---|---|---|
| `task_created` | `TaskDTO` | `project_{id}`| A new task was added to a column. |
| `task_updated` | `TaskDTO` | `project_{id}`| Task status, position, or content changed. |
| `task_deleted` | `{ taskId }` | `project_{id}`| Task was removed from the board. |
| `comment_added`| `CommentDTO` | `project_{id}`| A new comment was posted on a task. |
| `notification` | `NotificationDTO`| `user_{id}` | Direct alert (e.g., mention, due date). |
| `member_joined`| `MemberDTO` | `workspace_{id}`| A new user accepted an invitation. |

---

# 7. Security & API Defenses

To ensure stability and secure tenant data:

1. **CORS Configuration:** Configured to accept requests only from authorized Next.js frontend domains.
2. **Rate Limiting (Throttling):** Applied globally via NestJS.
   - Public Auth endpoints: 5 requests / minute.
   - Protected Business APIs: 100 requests / minute per IP.
3. **Input Validation:** Enforced by NestJS `ValidationPipe` and `class-validator` before data reaches controllers.
4. **Token Rotation:** Refresh tokens are rotated or invalidated securely to mitigate replay attacks.
5. **No Cross-Tenant Data Leakage:** Database queries in services always implicitly filter by the validated `workspace_id` derived from the authorization guard.