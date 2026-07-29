---
description: Summarize the current project state to resume development after an interruption. Trigger:    - catchup    - continue    - continue project    - resume    - where were we    - recap    - what's next    - continue from where we left off
---

# Workflow: Catchup

## Goal

Quickly understand the current state of the project without scanning the entire source code.

---

## Step 1 — Read project context

Load the following documentation:

```text
@docs/Product.md
@docs/Architecture/Architecture.md
@docs/Development/Tech-Stack.md
@docs/Development/Coding-Standards.md

```

Use these documents to understand:

* product goals
* system architecture
* technology stack
* coding conventions

Do not read implementation files in this step.

---

## Step 2 — Inspect Git

Run:

```bash
git status
git log --oneline -10
git diff --stat HEAD

```

Determine:

* current branch
* working tree status
* recent completed work
* uncommitted changes

---

## Step 3 — Summarize

Provide a concise summary with four sections.

### Current Project

Summarize the project in one sentence.

### Current Progress

Describe what has recently been completed.

### Current Working State

Include:

* current branch
* clean or dirty working tree
* any unfinished work

### Suggested Next Steps

Recommend the next 1–3 logical development tasks.

---

## Rules

* Never scan the entire source tree.
* Prefer project documentation over implementation files.
* Use Git history to understand recent progress.
* Keep the response concise.
* Reply in the same language as the user.

---

## Success Criteria

The summary should provide enough context for development to continue without requiring the user to explain the project again.

```