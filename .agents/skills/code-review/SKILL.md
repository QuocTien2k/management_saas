# Skill: Code Review

This skill guides the AI agent through reviewing source code for correctness, maintainability, consistency, and adherence to the project's standards.

---

## 1. Scope

Use this skill when the user requests:

- Review code
- Code review
- Analyze implementation
- Check code quality
- Review module
- Review pull request

Examples:

- Review Authentication module
- Review User API
- Review Product service
- Review Login page
- Review Pull Request

---

## 2. Required Context

Always read:

- @docs/Development/Coding-Standards.md
- @docs/Architecture/Architecture.md

Read when needed:

- @docs/Product.md
- @docs/Architecture/API.md
- @docs/Architecture/Database.md

---

## 3. Execution Workflow

### Step 1: Understand the Review Scope

Identify:

- Module or feature
- Frontend or Backend
- Files under review
- Review objective (quality, performance, security, etc.)

---

### Step 2: Review

Evaluate:

- Project structure
- Naming conventions
- Readability
- Maintainability
- Separation of concerns
- Reusability
- Error handling
- Validation
- Security
- Performance
- Consistency with project architecture

---

### Step 3: Report Findings

Categorize findings as:

### Critical

Issues that may cause:

- Bugs
- Security vulnerabilities
- Data loss
- Incorrect business behavior

---

### Warning

Issues that affect:

- Maintainability
- Scalability
- Performance
- Readability

---

### Suggestion

Optional improvements such as:

- Simpler implementation
- Better naming
- Better abstraction
- Improved consistency

---

### Step 4: Recommendations

Provide clear, actionable recommendations.

When possible:

- Explain why the issue exists.
- Explain the impact.
- Suggest an appropriate solution.

---

## 4. Example

User:

> Review Authentication module

Agent:

- Read Coding Standards.
- Review module structure.
- Review controllers, services, DTOs, and guards.
- Report Critical, Warning, and Suggestion items.
- Recommend improvements without modifying code unless requested.

---

## 5. Guardrails

- DO NOT rewrite code unless explicitly requested.
- DO NOT change project architecture during review.
- Base all findings on the project's documented standards.
- Distinguish between actual issues and personal preferences.
- Prioritize correctness, maintainability, security, and consistency over stylistic opinions.