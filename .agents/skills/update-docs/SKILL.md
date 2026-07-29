# Skill: Update Documentation

This skill guides the AI agent through the standard operating procedure (SOP) for keeping project documentation synchronized with codebase changes.

---

## 1. Scope & Execution Context

* **Primary Directory:** `docs/`
* **Core Reference Docs:**
  * `@docs/Architecture/API.md` *(For endpoint changes)*
  * `@docs/Architecture/Database.md` *(For schema changes)*
  * `@docs/Product.md` & `@docs/Plan/Implementation-Plan.md` *(For feature tracking)*

---

## 2. Standard Workflow for Updating Docs

### Step 1: Identify the Changes
Analyze the recent code modifications or the user's prompt to determine what changed:
* Was a new API endpoint added or an existing payload modified?
* Was a database table/collection created or a new column added?
* Were there changes to the system architecture or tech stack?

### Step 2: Locate the Target Document
Determine exactly which file(s) in the `docs/` directory need to be updated. (e.g., A database schema change means modifying `@docs/Architecture/Database.md`).

### Step 3: Apply Incremental Updates
* **For APIs:** Update the route, HTTP method, request payload (DTOs), and response examples.
* **For Databases:** Update the table schema definition, relationships, and index notes.
* **Format:** Strictly match the existing markdown formatting (tables, code blocks, bullet points) of the target document.

### Step 4: Review Completeness
* Ensure that no existing, unrelated documentation was accidentally deleted.
* Ensure all links and references remain intact.

---

## 3. Example Execution Scenario

**User Input:**
> "Tôi vừa thêm trường 'phone_number' vào bảng User và thêm nó vào API đăng ký. Hãy update docs."

**Agent Behavior:**
1. **Identify Changes:** `phone_number` added to User schema and Signup API.
2. **Target Files:** `@docs/Architecture/Database.md` and `@docs/Architecture/API.md`.
3. **Execution:** * Opens `Database.md` -> Adds `phone_number (VARCHAR, nullable)` to the User table schema.
   * Opens `API.md` -> Adds `"phone_number": "string"` to the request payload example of the `POST /api/v1/auth/signup` endpoint.

---

## 4. Guardrails

* **DO NOT** rewrite or restructure the entire document unless explicitly asked. Only update the specific sections affected by the change.
* **DO NOT** make assumptions about business rules; if the code change is ambiguous, ask the user for clarification before documenting.
* **DO NOT** document internal helper functions or private methods in high-level architectural docs.