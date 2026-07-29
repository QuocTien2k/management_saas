# Skill: Build UI

This skill guides the AI agent through designing, implementing, and updating user interfaces in the Frontend while following the project's architecture, coding standards, and design consistency.

---

## 1. Scope

Use this skill when the user requests:

- Create UI
- Create Page
- Create Component
- Create Form
- Build Dashboard
- Build Layout
- Update UI
- Improve UX
- Responsive Design

Examples:

- Create Login Page
- Build User Management UI
- Create Product Card component
- Build Dashboard layout
- Add Search Bar
- Create Profile Form

---

## 2. Required Context

Always read:

- @docs/Development/Coding-Standards.md
- @docs/Development/Tech-Stack.md
- @docs/Architecture/Architecture.md

Read when needed:

- @docs/Product.md
- @docs/Architecture/API.md

---

## 3. Execution Workflow

### Step 1: Analyze Request

Identify:

- Page or Component
- Feature
- User interactions
- Required data
- Responsive requirements

---

### Step 2: Validate UI Structure

Ensure:

- Folder structure follows project conventions.
- Components are reusable.
- State management follows project architecture.
- API integration points are clearly defined.

---

### Step 3: Implement

Generate or update only the Frontend layer.

Possible implementations include:

- Pages
- Components
- Layouts
- Forms
- Hooks
- Services
- Types
- State management
- API integration
- Loading and Error states

Implement clean and reusable components.

Separate presentation from business logic whenever possible.

---

### Step 4: User Experience

Apply when appropriate:

- Responsive design
- Accessibility
- Form validation
- Loading indicators
- Empty states
- Error handling
- User feedback

---

### Step 5: Verification

Before completion:

- Verify component structure.
- Verify responsive behavior.
- Verify API integration.
- Verify consistency with existing UI.
- Reuse existing components whenever possible.

---

## 4. Example

User:

> Create Login Page

Agent:

- Read Product.md
- Read Coding-Standards.md
- Create Login page
- Create Login form component
- Add client-side validation
- Connect Auth API
- Handle loading, success, and error states

---

## 5. Guardrails

- DO NOT implement backend business logic.
- DO NOT modify database schema.
- DO NOT duplicate existing UI components.
- Keep components modular and reusable.
- Follow the project's design system and coding standards.
- Maintain consistency across pages and components.