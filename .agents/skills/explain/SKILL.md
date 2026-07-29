# Skill: Explain Code / Architecture

This skill guides the AI agent through the standard operating procedure (SOP) for analyzing, breaking down, and explaining existing code, business logic, or architectural concepts within the project.

---

## 1. Scope & Execution Context

* **Primary Directory:** Anywhere within `backend/`, `frontend/`, or `docs/`.
* **Core Reference Docs:**
  * `@docs/Architecture/Architecture.md` *(For system-level explanations)*
  * `@docs/Development/Coding-Standards.md` *(For understanding project-specific patterns)*

---

## 2. Standard Workflow for Explaining

### Step 1: Identify the Target
Determine exactly what the user wants to understand:
* A specific function or class.
* A file's overall purpose.
* A complete business flow (e.g., "How does the login process work?").
* A database relationship or query.

### Step 2: Context Gathering
* Read the target code/file.
* Trace dependencies (e.g., if explaining a Controller, briefly check the injected Service).
* Cross-reference with `@docs/Architecture/` to ensure the explanation aligns with the documented system design.

### Step 3: Structure the Explanation
Always format the explanation logically:
1. **High-Level Overview:** A 1-2 sentence summary of what the code/flow does.
2. **Step-by-Step Breakdown:** Walk through the logic sequentially. Use bullet points or numbered lists.
3. **Key Components/Variables:** Highlight important state variables, DTOs, or database models involved.
4. **Edge Cases & Error Handling:** Point out how the code handles failures or unexpected inputs.

---

## 3. Example Execution Scenario

**User Input:**
> "Giải thích file backend/src/modules/auth/auth.middleware.ts giúp tôi."

**Agent Behavior:**
1. **Load Context:** Read the specified file and `@docs/Architecture/API.md`.
2. **Output Structure:**
   * **Overview:** Explains that this middleware intercepts requests to verify JWT tokens.
   * **Step-by-Step:** 1. Extracts token from headers. 2. Verifies signature using secrets. 3. Attaches `user` payload to the request object. 4. Throws `UnauthorizedException` if invalid.
   * **Dependencies:** Mentions it relies on the `jsonwebtoken` library and `.env` secrets.

---

## 4. Guardrails

* **DO NOT** rewrite or refactor the code unless explicitly asked by the user.
* **DO NOT** use overly dense jargon without context; explain things simply and clearly.
* **DO NOT** guess the purpose of missing dependencies; ask the user to provide the missing files if necessary to understand the full picture.