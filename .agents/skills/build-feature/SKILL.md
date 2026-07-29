# Skill: Build Feature

This skill guides the AI agent through standard procedures for planning, structuring, and implementing a new feature in either Backend, Frontend, or Full-stack scopes.

---

## 1. Scope & Location Resolver

Analyze the user prompt to determine where the code should be generated:

| Scope | Keywords / Prompts | Target Location | Context Docs to Read |
| :--- | :--- | :--- | :--- |
| **Backend (BE)** | Module, API, Service, Database, Auth, Controller, "ở BE" | `backend/src/` | `@docs/Architecture/API.md`<br>`@docs/Architecture/Database.md` |
| **Frontend (FE)** | Component, Page, Form, UI, Hook, State, "ở FE" | `frontend/src/` | `@docs/Development/Coding-Standards.md` |
| **Full-Stack** | End-to-end feature, complete feature flow (FE + BE) | `backend/src/` & `frontend/src/` | All Architecture & Development Docs |

---

## 2. Execution Workflow

### Step 1: Breakdown & Mapping
1. Parse all sub-features from the prompt (e.g., `login`, `signup`, `refreshToken`, `forgot-password`, `reset-password`).
2. Map these functions into modular file structures based on coding standards.
   * **Backend Example:** `src/modules/[feature-name]/` containing `controller`, `service`, `routes`, `dto`, `model`.
   * **Frontend Example:** `src/features/[feature-name]/` containing `components`, `hooks`, `services`, `types`.

### Step 2: Architecture & Contract Check
* Check `@docs/Architecture/Database.md` to ensure required data tables/collections exist.
* Check `@docs/Architecture/API.md` to align endpoint routes, request payloads, and response standards.

### Step 3: Code Implementation
1. Create or update types/interfaces/DTOs first.
2. Implement core business logic (Services / Hooks).
3. Implement entry points (Controllers/Routes for BE, UI Components/Pages for FE).
4. Apply error handling, input validation, and security best practices (JWT, hashing, sanitization).

### Step 4: Verification & Next Steps
* Suggest unit/integration test structure or trigger `@.agents/skills/write-test/`.
* If new endpoints or DB schemas were created, notify the user to update documentation via `@.agents/skills/update-docs/`.

---

## 3. Example Execution Scenario

**User Input:**
> "Tạo module Authentication ở BE gồm login, signup, refreshToken, forgot password, reset password"

**Agent Behavior:**
1. **Identify Scope:** Backend (`backend/src/modules/auth/`).
2. **Context Loaded:** Read `@docs/Architecture/API.md` & `@docs/Architecture/Database.md`.
3. **Directory Target:** `backend/src/modules/auth/`
4. **Generated File Structure:**
   * `auth.controller.ts` (Handles HTTP requests for login, signup, refresh, reset)
   * `auth.service.ts` (Handles password hashing, JWT generation, email reset tokens)
   * `auth.module.ts` (Binds endpoints to controller methods)
   * `dtos/` (`login.dto.ts`, `signup.dto.ts`, `reset-password.dto.ts`)
   * `auth.middleware.ts` (For protecting routes via JWT)

---

## 4. Guardrails

* **DO NOT** place backend business logic inside frontend directories, or vice versa.
* **DO NOT** hardcode configuration values (secrets, DB URIs, API keys); use environment variables from `.env`.
* **DO NOT** skip data validation on incoming requests.