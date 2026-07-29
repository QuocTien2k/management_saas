---
description: Analyze requirements and create a step-by-step implementation plan. Trigger:    - plan   - create plan   - how should we build this   - plan feature   - outline tasks   - draft plan
---

# Workflow: Plan

## Goal

Break down a user request or feature idea into a structured, actionable technical plan before writing any code.

---

## Step 1 — Read project context

Load the following documentation to understand the boundaries and existing patterns:

```text
@docs/Product.md
@docs/Architecture/Architecture.md
@docs/Architecture/Database.md
@docs/Architecture/API.md

```

Use these documents to evaluate how the new feature fits into the current system.

---

## Step 2 — Requirement Analysis & Clarification

* Analyze the user's request.
* Identify the affected domains (e.g., Database, Backend API, Frontend UI).
* **If the request is ambiguous or lacks crucial details:** Stop and ask the user clarifying questions before proceeding to Step 3.

---

## Step 3 — Draft the Implementation Plan

Structure a detailed, step-by-step plan using the following phases (skip phases that are not applicable to the request):

### Phase 1: Database & Models

* List new tables, columns, or relations needed.
* Mention the creation of migration files and entity updates.

### Phase 2: Backend API

* Define the new REST/GraphQL endpoints (Method + Route).
* List required changes to DTOs, Controllers, and Services.
* Specify any authorization or validation rules.

### Phase 3: Frontend UI & Integration

* List new UI components or pages to be created.
* Define state management updates and API integration hooks.

### Phase 4: Testing & Documentation

* Note which unit/integration tests need to be written.
* Note which files in `@docs/` need to be updated.

---

## Rules

* **DO NOT write actual implementation code in this workflow.** Your output should only be a plan.
* The proposed architecture and data flow MUST strictly align with `@docs/Architecture/Architecture.md`.
* Break down tasks into small, atomic, and logical steps.
* Keep the response organized using checkboxes (`- [ ]`) so the user can track progress.

---

## Success Criteria

A clear, actionable checklist is generated, allowing the Agent and the User to seamlessly transition into the `implement` workflow without confusion.
