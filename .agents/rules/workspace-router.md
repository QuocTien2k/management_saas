---
trigger: always_on
---

# Antigravity Workspace Router

You are the AI development assistant for this workspace.

Your responsibility is to identify the user's intent, load the correct project context, and delegate execution to the appropriate documentation, skill, or workflow.

Do not rely on assumptions. Always use the project's documentation as the source of truth.

---

# Source of Truth

Before performing any task, use the following documents as the primary references.

## Product

Read when the request involves:

- business requirements
- feature behavior
- user flows
- permissions
- acceptance criteria

→ `@docs/Product.md`

---

## Architecture

Read when the request involves:

- system design
- module boundaries
- project structure
- dependency direction
- communication between frontend/backend

→ `@docs/Architecture/Architecture.md`

---

## Database

Read when the request involves:

- entities
- relationships
- migrations
- Prisma
- PostgreSQL
- database design

→ `@docs/Architecture/Database.md`

---

## API

Read when the request involves:

- REST APIs
- request/response models
- authentication
- endpoint design
- frontend/backend integration

→ `@docs/Architecture/API.md`

---

## Development Standards

Read when writing or reviewing code.

→ `@docs/Development/Coding-Standards.md`

Read when technology decisions are required.

→ `@docs/Development/Tech-Stack.md`

---

## Implementation Plan

Read when:

- planning work
- deciding implementation order
- checking project progress
- determining next tasks

→ `@docs/Plan/Implementation-Plan.md`

---

# Skills

After loading the required documentation, delegate execution to the most appropriate skill.

| Task | Skill |
|------|------|
| Build backend feature | `@.agents/skills/build-feature/` |
| Build REST API | `@.agents/skills/build-api/` |
| Database work | `@.agents/skills/build-database/` |
| Frontend/UI | `@.agents/skills/build-ui/` |
| AI integration | `@.agents/skills/build-ai/` |
| Debugging | `@.agents/skills/debug/` |
| Code review | `@.agents/skills/code-review/` |
| Refactoring | `@.agents/skills/refactor/` |
| Documentation | `@.agents/skills/update-docs/` |
| Testing | `@.agents/skills/write-test/` |
| Explain existing code | `@.agents/skills/explain/` |

---

# Workflows

When a task requires multiple coordinated steps, use a workflow instead of an individual skill.

| Situation | Workflow |
|----------|----------|
| Understand the project | `@.agents/workflows/catchup.md` |
| Plan implementation | `@.agents/workflows/plan.md` |
| Implement a feature | `@.agents/workflows/implement.md` |
| Fix bugs | `@.agents/workflows/fix.md` |
| Final verification before completion | `@.agents/workflows/ship.md` |

---

# Routing Process

For every request:

1. Identify the task type.
2. Load only the required project documentation.
3. Determine whether the task needs:
   - a Skill
   - a Workflow
4. Follow the selected Skill or Workflow.
5. Produce output consistent with all loaded documentation.

---

# Rules

- Documentation is the single source of truth.
- Never invent project conventions.
- Never contradict the documented architecture.
- Never ignore the coding standards.
- Load only the context required for the current task.
- If multiple areas are involved, load all relevant documents before proceeding.