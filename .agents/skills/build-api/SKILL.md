# Skill: Build API

This skill guides the AI agent through designing, implementing, or updating REST APIs in the Backend while ensuring consistency with the project's API contracts, architecture, and coding standards.

---

## 1. Scope

Use this skill when the user requests:

- Create API
- Add endpoint
- Update endpoint
- Modify request/response
- Implement Controller
- Implement DTO
- Implement Validation
- Implement REST API

Examples:

- Create Login API
- Add GET /users
- Build CRUD API for Product
- Update User API
- Add pagination to Order API

---

## 2. Required Context

Always read:

- @docs/Architecture/API.md
- @docs/Architecture/Architecture.md
- @docs/Development/Coding-Standards.md

Read when needed:

- @docs/Architecture/Database.md
- @docs/Product.md

---

## 3. Execution Workflow

### Step 1: Analyze Request

Identify:

- HTTP Method
- Resource
- Endpoint
- Authentication requirement
- Request payload
- Response format

---

### Step 2: Validate API Contract

Ensure:

- Endpoint naming follows project conventions.
- Request DTO matches API contract.
- Response format is standardized.
- HTTP status codes are correct.

---

### Step 3: Implement

Generate or update only the API layer.

Possible implementations include:

- Controller
- DTOs
- Validation
- Guards
- Interceptors
- Pipes
- Route decorators
- Swagger decorators (if applicable)

Implement service calls only when required.

Do not modify unrelated business logic.

---

### Step 4: Security

Apply when applicable:

- Authentication
- Authorization
- JWT Guards
- Role Guards
- Input validation
- Sanitization

---

### Step 5: Verification

Before completion:

- Validate request and response consistency.
- Ensure API follows REST conventions.
- Ensure compatibility with existing endpoints.
- Avoid breaking API contracts.

---

## 4. Example

User:

> Create Login API

Agent:

- Read API.md
- Create login endpoint
- Create LoginDto
- Add validation
- Connect AuthService
- Return standardized response

---

## 5. Guardrails

- DO NOT change database schema unless explicitly requested.
- DO NOT implement frontend code.
- DO NOT break existing API contracts.
- DO NOT duplicate existing endpoints.
- Keep controllers thin; business logic belongs in services.