---
description: Perform final quality checks, testing, and generate commit messages before pushing code. Trigger:    - ship   - ready to commit   - finalize   - push code   - wrap up   - pre-commit
---

# Workflow: Ship

## Goal

Ensure the implemented code meets all quality standards, passes tests, and is properly documented before being committed to the repository.

---

## Step 1 — Review Changes

Run the following commands to inspect what has been modified (or ask the user to provide the diff):
```bash
git status
git diff --cached

```

* Check for any leftover `console.log`, `debugger`, `TODOs`, or unnecessary commented-out code.
* Ensure no sensitive data (e.g., hardcoded API keys, passwords) is staged.

---

## Step 2 — Verify Quality & Standards

Load the following documentation:

```text
@docs/Development/Coding-Standards.md

```

* Cross-check the staged changes against the project's coding rules.
* Remind the user to run their linter and formatter (e.g., `npm run lint`, `npm run format`) in their local environment.

---

## Step 3 — Test & Build Verification

* Confirm that unit or integration tests have been written or updated for the new feature or fix.
* Remind the user to run the test suite (e.g., `npm run test`) and verify the project builds successfully (e.g., `npm run build`).

---

## Step 4 — Documentation Check

* Did this change alter the database schema, API contracts, or architectural flow?
* If yes, verify that `@docs/Architecture/Database.md`, `@docs/Architecture/API.md`, or relevant documentation has been updated accordingly.

---

## Step 5 — Generate Commit Message

Based on the reviewed changes, propose a clean, descriptive commit message using the Conventional Commits format. Provide a title and an optional body for context:

*Examples:*

* `feat(auth): add forgot password endpoint`
* `fix(ui): resolve pagination overflow issue on branch list`
* `docs(api): update user endpoints payload structure`

---

## Rules

* **Do not bypass checks:** Always insist on reviewing the diff and verifying tests before giving the green light.
* **No new features:** The `ship` workflow is strictly for finalizing; do not write new implementation code here.
* **Clear communication:** If something looks wrong (e.g., missing tests or messy code), clearly warn the user before they commit.

---

## Success Criteria

The codebase is clean, tests are confirmed to pass, documentation is up-to-date, and a standardized commit message is provided to the user.