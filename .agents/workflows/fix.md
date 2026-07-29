---
description: Diagnose and resolve bugs while maintaining architectural integrity. Trigger:    - fix   - bug   - debug   - resolve issue   - patch   - fix error
---

# Workflow: Fix

## Goal

Diagnose, reproduce, and resolve bugs while strictly adhering to the system architecture and coding standards.

---

## Step 1 — Read project context

Load the following documentation to understand the expected behavior and system constraints:

```text
@docs/Architecture/Architecture.md
@docs/Development/Coding-Standards.md
@docs/Development/Tech-Stack.md

```

## Step 2 — Diagnose the Issue

* Analyze the user's bug report, error message, or stack trace.
* Identify the specific domain causing the issue (e.g., Frontend UI, Backend API, Database).
* If the error trace is incomplete or ambiguous, stop and ask the user for logs, steps to reproduce, or the specific file where the error occurs.

---

## Step 3 — Formulate a Fix Plan

* Identify the root cause of the bug.
* List the specific files and functions that need to be modified.
* Ensure the proposed fix does not violate boundaries defined in `@docs/Architecture/Architecture.md`.

---

## Step 4 — Implement and Verify

* Apply the necessary code changes.
* Ensure all related tests are updated or new tests are added to prevent future regressions.
* Provide a brief, clear explanation of *why* the bug occurred and *how* it was fixed.

---

## Rules

* **Scope Containment:** Only modify code directly related to the bug. Do not introduce unrelated features or large-scale refactoring during a fix.
* **No Architecture Drift:** The fix must conform to existing patterns. Do not bypass established validation layers, API contracts, or database schemas.
* **Safety First:** If the fix involves database schema changes or data migrations, clearly warn the user and prepare a safe strategy before executing.

---

## Success Criteria

The bug is successfully resolved, the root cause is clearly explained to the user, and no new regressions or architectural violations are introduced.
