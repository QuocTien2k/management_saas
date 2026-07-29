# Skill: Debug

This skill guides the AI agent through identifying, analyzing, and resolving bugs while minimizing changes to the existing implementation.

---

## 1. Scope

Use this skill when the user requests:

- Debug
- Fix bug
- Investigate issue
- Resolve error
- Analyze exception
- Troubleshoot

Examples:

- Debug Authentication module
- Fix Login API
- Resolve JWT validation error
- Investigate User module
- Fix frontend routing issue
- Debug Product service

---

## 2. Required Context

Always read:

- @docs/Architecture/Architecture.md
- @docs/Development/Coding-Standards.md

Read when needed:

- @docs/Architecture/API.md
- @docs/Architecture/Database.md
- @docs/Product.md

---

## 3. Execution Workflow

### Step 1: Understand the Issue

Identify:

- Error message
- Expected behavior
- Actual behavior
- Affected module
- Scope of impact

---

### Step 2: Analyze

Inspect:

- Related files
- Business logic
- API flow
- Database interactions
- Dependencies

Trace the root cause before making changes.

---

### Step 3: Resolve

Apply the smallest possible fix.

When appropriate:

- Fix logic errors
- Fix validation
- Fix API handling
- Fix database queries
- Fix state management
- Fix UI behavior

Avoid unnecessary rewrites.

---

### Step 4: Verify

Ensure:

- Original issue is resolved.
- No new issues are introduced.
- Existing functionality continues to work.
- Project conventions remain consistent.

---

## 4. Example

User:

> Debug Authentication module in Backend

Agent:

- Read relevant documentation.
- Inspect Authentication module.
- Identify root cause.
- Apply minimal changes.
- Verify login, signup, refresh token, and related flows continue working.

---

## 5. Guardrails

- DO NOT rewrite the entire module unless explicitly requested.
- DO NOT introduce unrelated improvements.
- DO NOT change APIs or database schemas unless required to fix the issue.
- Prefer minimal, targeted fixes.
- Explain the root cause before or alongside the solution.